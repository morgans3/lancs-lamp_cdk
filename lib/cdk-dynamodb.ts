import cdk = require("@aws-cdk/core");
import dynamodb = require("@aws-cdk/aws-dynamodb");

export class DynamoDBTable extends cdk.Stack {
  public readonly dynamoTable: dynamodb.Table;

  constructor(scope: any, id: string, props: any) {
    super(scope, id, props);

    const primarykey = props.tab.fields.filter((x: any) => x.key === "primary");
    const secondarykey = props.tab.fields.filter((x: any) => x.key === "secondary");
    const partitionKey = { name: primarykey[0].name, type: primarykey[0].type };

    let sortKey = undefined;
    if (secondarykey.length > 0) sortKey = { name: secondarykey[0].name, type: secondarykey[0].type };

    let TableProps: dynamodb.TableProps = { partitionKey: partitionKey, tableName: props.tab.name + "-" + props.name, sortKey: sortKey, removalPolicy: cdk.RemovalPolicy.DESTROY, billingMode: dynamodb.BillingMode.PAY_PER_REQUEST };

    this.dynamoTable = new dynamodb.Table(this, props.tab.name + "-items-" + props.name, TableProps);
  }
}
