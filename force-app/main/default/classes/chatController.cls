public without sharing class chatController {
  @AuraEnabled
  public static List<User> getUsers(String name) {
    try {
      String key = '%' + name + '%';
      return [SELECT Id, Name, FirstName, Alias FROM User WHERE Name LIKE :key];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled
  public static Map<String, Object> getConversation(User user) {
    Map<String, Object> result;
    try {
      result = new Map<String, Object>{
        'messages' => null,
        'chat' => null,
        'userChat' => null
      };
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }

    return result;
  }

  @AuraEnabled
  public static void createMessage(
    String userId,
    String userChatId,
    String chatId
  ) {
    try {
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}
