import { Driver,
    Session,
    Result,
    Node,
    v1,
    ResultSummary,
    IStatementStatistics,
    Record,
    Neo4jError,
	Path,
	PathSegment,
	Relationship } from 'neo4j-driver';
import * as chalk from 'chalk';
import { stringify } from './stringify';
import { NodeFeedback, EdgeFeedback } from './interfaces';
import { inspect } from 'util';
export class NeoPersistor {
    //class wide parameters
    protected connex: string;
    protected driver: Driver; //Driver(this.connex, neo.auth.basic(this.username, this.password));

    //constructor receives the necessary information to create a connection
    constructor(protected protocol: string,
        protected hostname: string,
        protected port: number,
        protected username: string,
        protected password: string) {
        this.connex = `${this.protocol}://${this.hostname}`;
        this.driver = v1.driver(this.connex, v1.auth.basic(this.username, this.password));
    }
    
    //a single method that returns a generic response
    protected execute(query: string): Promise<Record[]> {
        const session: Session = this.driver.session();
        let res: Result = session.run(query);
        return new Promise((resolve, reject) => {
			let records: Record[] = [];
            res.subscribe({
			  onNext: (record: Record) => {
			    records.push(record);
			  }, onCompleted: (summary: ResultSummary) => {
			    session.close(() => null);
                this.driver.close();
			    resolve(records);
			  }, onError: (error: Neo4jError) => {
			    console.log(error);
                session.close(() => null);
                this.driver.close();
                reject(error);
			  }
			});
        });
    }
    
    /**
     * Creates one single node
     * @param {string} label l - The node's label
     * @param {Object} props p - The node's properties
     * @return {Promise<Node>} n - The created node
     */
    createNode(label: string, props: Object): Promise<NodeFeedback> {
        return new Promise((resolve, reject) => {
            let query: string = `CREATE (n:${label} ${stringify(props)}) RETURN n`;

            this.execute(query)
            .then((records: Record[]) => {
                let feedback: NodeFeedback[] = records.map(r => {
                    let nodef: NodeFeedback {
                        label: r.get('n').labels[0],
                        properties: r.get('n').properties,
                        action: 'create'
                    };
                    return nodef;
                })
                resolve(feedback[0]);
            })
            .catch((err: Neo4jError) => {
                console.log(err.message);
                reject(err);
            });
        })
    }
    
    /**
     * Creates a relationship between two nodes
     * @param {string} fromLabel
     * @param {Object} fromCondition
     * @param {Object} toCondition
     * @param {string} edgeLabel
     * @param {Object} edgeProperties
     * @param {string} toLabel
     * @return {Promise<Relationship>} p - The promise wrapping the created relationship
     */
    createEdge(fromLabel: string, fromCondition: Object, toCondition: Object, edgeLabel: string, edgeProperties: Object, toLabel: string) {
        let props: string = stringify(Object.assign({}, edgeProperties, {createdAt: 'timestamp()'}));
        let query: string = `
        MATCH (from:${fromLabel} ${stringify(fromCondition)})
        MATCH (to:${toLabel} ${stringify(toCondition)})
        MERGE (from)-[r:${edgeLabel} ${stringify(edgeProperties)}]->(to)
        RETURN from,r,to
        `;
        return new Promise((resolve, reject) => {
			this.execute(query)
            .then((records: Record[]) => {
                let feedback: EdgeFeedback = records.map(r => {
                    //console.log(inspect(r, true, 5, true));
					let edgef: EdgeFeedback = {
						from: r.get('from'),
                        to: r.get('to'),
                        action: 'create',
                        edge: r.get('r')
                    }
                    return edgef;
                })[0];
                resolve(feedback);
            })
            .catch((err: Neo4jError) => {
                //console.log(err);
                reject(err);
            });
        });
    }

    /**
     * Deletes node(s)
     * @param {string} label
     * @param {Object} [condition] - condition to filter node(s) to be deleted. If omitted, all nodes matching label will be deleted.
     * @return {NodeFeedback} feedback - the result of the delete operation
     */
    deleteNode(label: string, condition: Object = {}): Promise<NodeFeedback> {
		let query: string = `
        MATCH(n:${label} ${stringify(condition)})
        WITH n, n.id as id
        DETACH DELETE n
        RETURN id
        `;
        return new Promise((resolve, reject) => {
			this.execute(query)
            .then((records: Record[]) => {
                let feedback: NodeFeedback[] = records.map(r => {
                    return {
	                    label: label,
	                    action: 'delete',
	                    properties: {
	                        id: r.get('id')
	                    }
	                };
                });
                resolve(feedback);
            })
            .catch(err => reject(err));
        });
    }

    /**
     * Updates one or all node(s) matching a certain condition
     * @param {string} label
     * @param {Object} condition
     * @param {Object} newParameters
     */
    updateNodes(label: string, condition: Object, newParams: Object): Promise<NodeFeedback[]> {
		return new Promise((resolve, reject) => {
			let query: string = `
            MERGE (n:${label} ${stringify(condition)})
            SET n += ${stringify(newParams)}
            RETURN n
            `;

            this.execute(query)
            .then((records: Record[]) => {
				let feedback: NodeFeedback[] = records.map(r => {
					let nodef: NodeFeedback = {
                        action: 'update',
                        label: r.get('n').labels[0],
                        properties: r.get('n').properties
                    };
                    return nodef;
                });
                resolve(feedback);
            })
            .catch(err => reject(err));
        });
    }

    /**
     * Returns one or many node(s) matching a certain condition
     * @param {string} label
     * @param {Object} condition
     */
    getNodes(label: string, condition: Object = {}): Promise<Node[]> {
		return new Promise((resolve, reject) => {
			let query: string = `
            MATCH (n:${label} ${stringify(condition)})
            RETURN n
            `;

            this.execute(query)
            .then((records: Record[]) => {
                let responses: Node[] = records.map(r => {
                    let res: Node = r.get('n');
                    return res;
                })
                resolve(responses);
            })
            .catch(err => reject(err));
        });
    }

    /**
     * Returns one, many, or all nodes that match relationship criteria
     * @param {string[]} label(s)
     * @param {Object} condition
     */
    getNodesByRelationships(labels: string[], condition: Object = {}): Promise<Node[]> {
		return new Promise((resolve, reject) => {
			let r: string = labels.map(l => `:${l}`).join('|');
            let query: string = `
            MATCH ()-[r${r}]->(n)
            RETURN n
            `;

            this.execute(query)
            .then((records: Record[]) => {
				let responses: Node[] = records.map(r => r.get('n'));
                resolve(responses);
            })
            .catch(err => reject(err));
        });
    }

    /**
     * returns shortest path between two nodes
     * @param {string} from
     * @param {string} to
     * @param {number} [maxHops]
     * @param {Object} [fromCondition]
     * @param {Object} [toCondition]
     * @return {Promise<PathResponse[]>} p
     */
    getShortestPathBetweenNodes(from: string, to: string, maxHops: number, fromCondition: Object = {}, toCondition: Object = {}): Promise<Path[]> {
        return new Promise((resolve, reject) => {
			let query: string = `
            MATCH (n1:${from} ${stringify(fromCondition)}),
            (n2:${to} ${stringify(toCondition)}),
            p = shortestPath((n1)-[*..${maxHops}]-(n2))
            RETURN p
            `;
            
            this.execute(query)
            .then((records: Record[]) => {
                let paths: Path[] = records.map(r => r.get('p'));
				resolve(paths);
            })
            .catch(err => reject(err));
        });
    }

    /**
     * Deletes all relationships from node
     * @param {string} fromNodeLabel
     * @param {Object} fromNodeCondition
     * @return {Promise<EdgeFeedback>} p
     */
    deleteAllRealtionshipsFromNode(nodeLabel: string, nodeCondition: Object): Promise<EdgeFeedback[]> {
        return new Promise((resolve, reject) => {
			let query: string  = `
            MATCH (n:${nodeLabel} ${stringify(nodeCondition)})-[rel]-(n2)
            WITH n, rel, rel as r, n2
            DELETE rel
            RETURN r, n, n2
            `;
			
            this.execute(query)
            .then((records: Record[]) => {
				let feedback: EdgeFeedback[] = records.map(r => {
                    let feed: EdgeFeedback = {
						action: 'delete',
                        from: r.get('n'),
                        to: r.get('n2'),
                        edge: r.get('r')
                    };
                    return feed;
                });
                resolve(feedback);
            })
            .catch(err => reject(err));
        });
    }

    /**
     * Deletes relationships that match a certain criteria from nodes that match criteria
     * @param {string} edgeLabel
     * @param {Object} edgeCondition
     * @param {string} fromNodeLabel
     * @param {Object} fromNodeCondition
     * @param {string} toNodeLabel
     * @param {Object} toNodeCondition
     * @return {Promise<boolean>} p
     */
    deleteRelationshipBetweenTwoNodes(edgeLabel: string, fromNodeLabel: string, fromNodeCondition: Object, toNodeLabel: string, toNodeCondition: Object): Promise<EdgeFeedback> {
        return new Promise((resolve, reject) => {
			let query: string = `
            MATCH (from:${fromNodeLabel} ${stringify(fromNodeCondition)})-[rel:${edgeLabel}]-(to:${toNodeLabel} ${stringify(toNodeCondition)})
            WITH rel, rel as r, from, to
            DELETE rel
            RETURN from, to, r
            `;

            this.execute(query)
            .then((records: Record[]) => {
				let from: Node = records.map(r => r.get('from'))[0];
				let to: Node = records.map(r => r.get('to'))[0];
				let rel: Relationship = records.map(r => r.get('r'))[0];
                console.log(rel);
                let edgef: EdgeFeedback = {
					from: from,
                    to: to,
                    edge: rel,
                    action: 'delete'
                };

                resolve(edgef);
            })
            .catch(err => reject(err));
        });
    }
}