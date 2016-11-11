const neo = require('neo4j-driver').v1;
import { Driver, Session } from './interfaces';
import * as chalk from 'chalk';
import { stringify } from './stringify';

export class NeoPersistor {
    //class wide parameters
    protected connex: string;

    //constructor receives the necessary information to create a connection
    constructor(protected protocol: number,
        protected hostname: string,
        protected port: number,
        protected username: string,
        protected password: string) {
            this.connex = `${this.protocol}://${this.hostname}`;
    }

    //a single method that returns a generic response
    protected execute(query: string): Promise<any> {
        const driver: Driver = new Driver() //Driver(this.connex, neo.auth.basic(this.username, this.password));
        const session: Session = driver.session();

        return new Promise((resolve, reject) => {
            session
            .run(query)
            .then((result: any) => {})
            .catch((err) => {
                session.close();
                console.log(chalk.red(err));
                reject(err);
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
            let query: string = `CREATE (n:${label} stringify(props)) RETURN n`;

            this.execute(query)
            .then((n: Node) => {

            })
            .catch(err => {

            })
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

    /**
     * Deletes one single node
     * @param {string} label
     * @param {Object} condition
     */

    /**
     * Updates one single node
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