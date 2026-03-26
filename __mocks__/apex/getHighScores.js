const getHighScores = jest.fn().mockResolvedValue([
    { PlayerName__c: 'TopDog', Score__c: 500 },
    { PlayerName__c: 'Runner', Score__c: 300 },
    { PlayerName__c: 'Newbie', Score__c: 100 }
]);
export default getHighScores;
