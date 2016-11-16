import { Node, Relationship } from 'neo4j-driver';
export interface EdgeFeedback {
    from: Node;
    to: Node;
    edge: Relationship
    action: string;
}