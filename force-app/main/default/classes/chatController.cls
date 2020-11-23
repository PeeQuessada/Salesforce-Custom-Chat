public without sharing class chatController {
  @AuraEnabled
  //public static List<User> getUsers(String name) {
  public static Map<String, Object> getUsers(String name) {
    Map<String, Object> result;
    try {
      String key = '%' + name + '%';
      List<Chat__c> listChats = getChats(key);
      List<User> listUsers = [
        SELECT Id, Name, FirstName, Alias
        FROM User
        WHERE Name LIKE :key AND Id != :UserInfo.getUserId()
      ];

      result = new Map<String, Object>{
        'chats' => listChats,
        'users' => listUsers
      };

      return result;
      //return listUsers;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled(Cacheable=true)
  public static Map<String, Object> getConversation(Id chatId) {
    Map<String, Object> result;
    try {
      if (chatId.getSobjectType().getDescribe().getName() == 'User') {
        chatId = getChatId(chatId);
      }

      if (chatId == null) {
        return new Map<String, Object>();
      }

      result = new Map<String, Object>{
        'messages' => [
          SELECT
            Id,
            Message__c,
            CreatedById,
            CreatedBy.Name,
            FORMAT(CreatedDate)
          FROM Message__c
          WHERE Chat__c = :chatId
        ],
        'chat' => [SELECT Id, Name FROM Chat__c WHERE Id = :chatId],
        'userChat' => [
          SELECT Id, User__c
          FROM ChatUser__c
          WHERE Chat__c = :chatId
        ],
        'userId' => UserInfo.getUserId()
      };
      System.debug('messages ' + result.get('messages'));
      System.debug('chatId ' + chatId);
      return result;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled
  public static List<Chat__c> getChats(String userName) {
    try {
      String userId = UserInfo.getUserId();
      String query;

      if (userName != null && userName != '') {
        query =
          'SELECT Id, Name, ' +
          '(SELECT Id, User__c FROM Chats__r WHERE User__c != :userId) Chats, ' +
          '(SELECT Id, Message__c FROM Messages__r ORDER BY CreatedDate LIMIT 1) Messages ' +
          'FROM Chat__c WHERE Id IN ' +
          '(SELECT Chat__c FROM ChatUser__c WHERE Name LIKE :userName)';
      } else {
        query =
          'SELECT Id, Name, ' +
          '(SELECT Id, User__c FROM Chats__r WHERE User__c != :userId) Chats, ' +
          '(SELECT Id, Message__c FROM Messages__r ORDER BY CreatedDate LIMIT 1) Messages ' +
          'FROM Chat__c WHERE Id IN ' +
          '(SELECT Chat__c FROM ChatUser__c WHERE User__c = :userId)';
      }
      System.debug('query ' + query);
      return database.query(query);
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled
  public static String createMessage(
    String toUserId,
    String chatId,
    String message
  ) {
    try {
      String fromUserId = UserInfo.getUserId();
      // Nao existe o chat (Usuarios nunca conversaram)
      if (chatId == null) {
        chatId = createChat(toUserId, fromUserId);
      }

      // Existiu uma conversa entre esse usuarios
      insert new Message__c(Chat__c = chatId, Message__c = message);
      return chatId;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  private static Id createChat(String toUserId, String fromUserId) {
    Chat__c chat = new Chat__c();
    insert chat;

    ChatUser__c chatUserTo = new ChatUser__c(
      Chat__c = chat.Id,
      User__c = toUserId
    );
    ChatUser__c chatUserFrom = new ChatUser__c(
      Chat__c = chat.Id,
      User__c = fromUserId
    );
    insert new List<ChatUser__c>{ chatUserTo, chatUserFrom };

    return chat.Id;
  }

  private static Id getChatId(Id userId) {
    Set<Id> setChatId = new Set<Id>();

    for (ChatUser__c obj : [
      SELECT Id, Chat__c
      FROM ChatUser__c
      WHERE User__c = :UserInfo.getUserId()
    ]) {
      setChatId.add(obj.Chat__c);
    }

    List<ChatUser__c> chatUser = [
      SELECT Id, Chat__c
      FROM ChatUser__c
      WHERE User__c = :userId AND Chat__c IN :setChatId
    ];
    if (chatUser.size() == 0) {
      return null;
    }
    return chatUser[0].Chat__c;
  }
}
