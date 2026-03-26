public with sharing class PacmanScoreController {

    @AuraEnabled(cacheable=false)
    public static void saveScore(String playerName, Integer score) {
        PacmanScore__c record = new PacmanScore__c(
            PlayerName__c = playerName,
            Score__c = score
        );
        insert record;
    }
}
