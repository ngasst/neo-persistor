import { NeoPersistor } from './persistor';
import { Record, Path, PathSegment } from 'neo4j-driver';
import { NodeFeedback, EdgeFeedback, NodeResponse } from './interfaces';
import { inspect } from 'util';

const persistor: NeoPersistor = new NeoPersistor('bolt', 'gasst.dynu.com', 7687, 'neo4j', 'jzZinV161zGlFi7IIHsJcNtu');
//const persistor: NeoPersistor = new NeoPersistor(null, null, null, null, null, 'http://storyient:DXeBJ4JDDwh8oU3SaGNA@hobby-jfoipabmjcbmgbkecmfccknl.dbs.graphenedb.com:24789/db/data/');

persistor.createNode('Test', {id: 'lkdjflksj154545'})
.then((records1: Record[]) => {
    //console.log(records1);
    persistor.createNode('Test2', {id: 'ljkdjfdkljf236'})
    .then((records2: Record[]) => {
		//console.log(records2);
        persistor.createEdge('Test', {id: 'lkdjflksj154545'}, {id: 'ljkdjfdkljf236'}, 'REL_TO_BE', {oooh: 'yeahhhhh'}, 'Test2')
        .then((records3: Record[]) => {
            //console.log(records3);
            /*persistor.deleteNode('Test')
            .then((feedack: NodeFeedback) => {
                console.log(feedack);
            })
            .catch(err => console.log(err));
            persistor.updateNodes('Test', {id: 'lkdjflksj154545'}, {id: '1234', otherProp: 'otherValue'})
            .then((feedback: NodeFeedback[]) => {
                console.log(feedback);
            })
            .catch(err => console.log(err));
            persistor.getNodes('Writer')
            .then((res: NodeResponse[]) => {
				console.log(inspect(res, true, 4, true));
            })
            .catch(err => console.log(err));
            persistor.getNodesByRelationships(['OWNS', 'CONTRIBUTED_TO'])
            .then((res: NodeResponse[]) => {
				console.log(inspect(res, true, 4, true));
            })
            .catch(err => console.log(err));
            persistor.getShortestPathBetweenNodes('User', 'Editor', 5, {id: '57fe29bdaf125b0dbf9e4121'}, {id: '57ff7ecfe4736702f7ae63ab'})
            .then((res: Path[]) => {
				console.log(inspect(res, true, 8, true));
            })
            .catch(err => console.log(err));
            persistor.deleteRelationshipBetweenTwoNodes('REL_TO_BE', 'Test', {id: 'lkdjflksj154545'}, 'Test2', {id: 'ljkdjfdkljf236'})
            .then((rec: Path) => {
				console.log(inspect(rec, true, 8, true));
            })
            .catch(err => console.log(err));*/
            persistor.deleteAllRealtionshipsFromNode('Test', {id: 'lkdjflksj154545'})
            .then((rec: EdgeFeedback[]) => {
				console.log(inspect(rec, true, 8, true));
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
})
.catch(err => console.log(err));