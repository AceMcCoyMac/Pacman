@isTest
private class PacmanScoreControllerTest {

    // ── saveScore ─────────────────────────────────────────────────────────────

    @isTest
    static void testSaveScore_basic() {
        Test.startTest();
        PacmanScoreController.saveScore('TestPlayer', 42);
        Test.stopTest();

        List<PacmanScore__c> scores = [
            SELECT PlayerName__c, Score__c
            FROM PacmanScore__c
            WHERE PlayerName__c = 'TestPlayer'
        ];
        System.assertEquals(1, scores.size(), 'Expected exactly one record');
        System.assertEquals(42, (Integer)scores[0].Score__c, 'Score should match');
    }

    @isTest
    static void testSaveScore_zeroScore() {
        Test.startTest();
        PacmanScoreController.saveScore('ZeroHero', 0);
        Test.stopTest();

        List<PacmanScore__c> scores = [
            SELECT Score__c FROM PacmanScore__c WHERE PlayerName__c = 'ZeroHero'
        ];
        System.assertEquals(1, scores.size(), 'Record should be created with zero score');
        System.assertEquals(0, (Integer)scores[0].Score__c, 'Score should be zero');
    }

    @isTest
    static void testSaveScore_highScore() {
        Test.startTest();
        PacmanScoreController.saveScore('Ace', 999999);
        Test.stopTest();

        List<PacmanScore__c> scores = [
            SELECT Score__c FROM PacmanScore__c WHERE PlayerName__c = 'Ace'
        ];
        System.assertEquals(1, scores.size());
        System.assertEquals(999999, (Integer)scores[0].Score__c);
    }

    @isTest
    static void testSaveScore_longName() {
        String longName = 'A'.repeat(255);
        Test.startTest();
        PacmanScoreController.saveScore(longName, 10);
        Test.stopTest();

        List<PacmanScore__c> scores = [
            SELECT PlayerName__c FROM PacmanScore__c WHERE PlayerName__c = :longName
        ];
        System.assertEquals(1, scores.size(), 'Should handle max-length player name');
    }

    @isTest
    static void testSaveScore_multipleRecords() {
        Test.startTest();
        PacmanScoreController.saveScore('Player1', 100);
        PacmanScoreController.saveScore('Player1', 200);
        PacmanScoreController.saveScore('Player2', 150);
        Test.stopTest();

        List<PacmanScore__c> all = [SELECT Id FROM PacmanScore__c];
        System.assertEquals(3, all.size(), 'All three records should be saved');
    }

    // ── getHighScores ─────────────────────────────────────────────────────────

    @isTest
    static void testGetHighScores_sortedDescending() {
        insert new PacmanScore__c(PlayerName__c = 'Alpha', Score__c = 100);
        insert new PacmanScore__c(PlayerName__c = 'Beta',  Score__c = 300);
        insert new PacmanScore__c(PlayerName__c = 'Gamma', Score__c = 200);

        Test.startTest();
        List<PacmanScore__c> results = PacmanScoreController.getHighScores();
        Test.stopTest();

        System.assert(results.size() >= 3, 'Should return at least 3 results');
        System.assertEquals('Beta', results[0].PlayerName__c, 'Highest score should be first');
        System.assert(
            results[0].Score__c >= results[1].Score__c,
            'Results should be sorted descending'
        );
    }

    @isTest
    static void testGetHighScores_returnsAtMostTen() {
        List<PacmanScore__c> batch = new List<PacmanScore__c>();
        for (Integer i = 1; i <= 15; i++) {
            batch.add(new PacmanScore__c(PlayerName__c = 'P' + i, Score__c = i * 10));
        }
        insert batch;

        Test.startTest();
        List<PacmanScore__c> results = PacmanScoreController.getHighScores();
        Test.stopTest();

        System.assert(results.size() <= 10, 'Should return at most 10 records');
    }

    @isTest
    static void testGetHighScores_emptyOrg() {
        Test.startTest();
        List<PacmanScore__c> results = PacmanScoreController.getHighScores();
        Test.stopTest();

        System.assertNotEquals(null, results, 'Should return empty list, not null');
        System.assertEquals(0, results.size(), 'Should return empty list when no scores');
    }

    @isTest
    static void testGetHighScores_hasRequiredFields() {
        insert new PacmanScore__c(PlayerName__c = 'FieldTest', Score__c = 77);

        Test.startTest();
        List<PacmanScore__c> results = PacmanScoreController.getHighScores();
        Test.stopTest();

        System.assert(results.size() > 0);
        System.assertNotEquals(null, results[0].PlayerName__c, 'PlayerName__c must be populated');
        System.assertNotEquals(null, results[0].Score__c, 'Score__c must be populated');
        System.assertNotEquals(null, results[0].CreatedDate, 'CreatedDate must be populated');
    }

    @isTest
    static void testRoundTrip_saveAndRetrieve() {
        Test.startTest();
        PacmanScoreController.saveScore('RoundTrip', 456);
        List<PacmanScore__c> results = PacmanScoreController.getHighScores();
        Test.stopTest();

        Boolean found = false;
        for (PacmanScore__c r : results) {
            if (r.PlayerName__c == 'RoundTrip' && (Integer)r.Score__c == 456) {
                found = true;
                break;
            }
        }
        System.assert(found, 'Saved score should appear in high scores');
    }
}
