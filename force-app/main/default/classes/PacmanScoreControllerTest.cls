@IsTest
public class PacmanScoreControllerTest {

    @IsTest
    static void testSaveScore() {
        Test.startTest();
        PacmanScoreController.saveScore('TestPlayer', 1000);
        Test.stopTest();

        List<PacmanScore__c> scores = [
            SELECT PlayerName__c, Score__c
            FROM PacmanScore__c
            WHERE PlayerName__c = 'TestPlayer'
        ];

        System.assertEquals(1, scores.size(), 'Should have inserted one score record');
        System.assertEquals('TestPlayer', scores[0].PlayerName__c, 'Player name should match');
        System.assertEquals(1000, scores[0].Score__c, 'Score should match');
    }

    @IsTest
    static void testSaveScoreZero() {
        Test.startTest();
        PacmanScoreController.saveScore('ZeroPlayer', 0);
        Test.stopTest();

        List<PacmanScore__c> scores = [
            SELECT PlayerName__c, Score__c
            FROM PacmanScore__c
            WHERE PlayerName__c = 'ZeroPlayer'
        ];

        System.assertEquals(1, scores.size(), 'Should have inserted one score record');
        System.assertEquals(0, scores[0].Score__c, 'Score should be zero');
    }
}
