@isTest
private class PacmanScoreControllerTest {

    @isTest
    static void testSaveScore() {
        Test.startTest();
        PacmanScoreController.saveScore('TestPlayer', 42);
        Test.stopTest();

        List<PacmanScore__c> scores = [SELECT PlayerName__c, Score__c FROM PacmanScore__c WHERE PlayerName__c = 'TestPlayer'];
        System.assertEquals(1, scores.size());
        System.assertEquals(42, (Integer)scores[0].Score__c);
    }

    @isTest
    static void testGetHighScores() {
        insert new PacmanScore__c(PlayerName__c = 'Alpha', Score__c = 100);
        insert new PacmanScore__c(PlayerName__c = 'Beta',  Score__c = 200);

        Test.startTest();
        List<PacmanScore__c> results = PacmanScoreController.getHighScores();
        Test.stopTest();

        System.assert(results.size() >= 2);
        System.assertEquals('Beta', results[0].PlayerName__c);
    }
}