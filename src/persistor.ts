import { Driver, Session, Result, Node, v1, ResultSummary, IStatementStatistics, Record, Neo4jError } from 'neo4j-driver';
import * as chalk from 'chalk';
import { stringify } from './stringify';
import { NodeFeedback, EdgeFeedback } from './interfaces';
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
    createNode(label: string, props: Object) {
        return new Promise((resolve, reject) => {
            let query: string = `CREATE (n:${label} ${stringify(props)}) RETURN n`;

            this.execute(query)
            .then((records: Record[]) => {
                /*let feedback: NodeFeedback[] = records.map(r => {
                    return {
                        label:r.get('_')
                    }
                })*/
                console.log(records);
                resolve(records);
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
                resolve(records);
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
     * Updates node(s)
     * @param {string} label
     * @param {Object} condition
     * @param {Object} newParameters
     */ 

    /**
     * Returns one single node
     * @param {string} label
     * @param {Object} condition
     */
    
    /**
     * Returns one or all nodes that match criteria
     * @param {string} label
     * @param {Object} condition
     */

    /**
     * Returns one single node that match relationship criteria
     * @param {string} nodeLabel
     * @param {string} edgeLabel
     * @param {Object} edgeCondition
     */

    /**
     * Returns one, many, or all nodes that match relationship criteria
     * @param {string[]} label(s)
     * @param {Object} condition
     */

    /**
     * Deletes all relationships from two nodes that match criteria
     * @param {string} fromNodeLabel
     * @param {Object} fromNodeCondition
     * @param {string} toNodeLabel
     * @param {Object} toNodeCondition
     * @return {Promise<boolean>} p
     */

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
}