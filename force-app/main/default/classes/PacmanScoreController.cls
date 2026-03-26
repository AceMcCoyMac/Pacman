public with sharing class PacmanScoreController {

    @AuraEnabled(cacheable=false)
    public static void saveScore(String playerName, Integer score) {
        PacmanScore__c record = new PacmanScore__c(
            PlayerName__c = playerName,
            Score__c = score
        );
        insert record;
    }

    @AuraEnabled(cacheable=false)
    public static List<PacmanScore__c> getHighScores() {
        return [
            SELECT PlayerName__c, Score__c, CreatedDate
            FROM PacmanScore__c
            ORDER BY Score__c DESC
            LIMIT 10
        ];
    }
}