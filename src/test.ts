import { NeoPersistor } from './persistor';
import { Record } from 'neo4j-driver';
import { NodeFeedback, EdgeFeedback } from './interfaces';

const persistor: NeoPersistor = new NeoPersistor('bolt', 'gasst.dynu.com', 7687, 'neo4j', 'jzZinV161zGlFi7IIHsJcNtu');
//const persistor: NeoPersistor = new NeoPersistor(null, null, null, null, null, 'http://storyient:DXeBJ4JDDwh8oU3SaGNA@hobby-jfoipabmjcbmgbkecmfccknl.dbs.graphenedb.com:24789/db/data/');

persistor.createNode('Test', {id: 'lkdjflksj154545'})
.then((records1: Record[]) => {
    console.log(records1);
    persistor.createNode('Test2', {id: 'ljkdjfdkljf236'})
    .then((records2: Record[]) => {
		console.log(records2);
        persistor.createEdge('Test', {id: 'lkdjflksj154545'}, {id: 'ljkdjfdkljf236'}, 'REL_TO_BE', {oooh: 'yeahhhhh'}, 'Test2')
        .then((records3: Record[]) => {
            console.log(records3);
            persistor.deleteNode('Test')
            .then((feedack: NodeFeedback) => {
                console.log(feedack);
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
})
.catch(err => console.log(err));