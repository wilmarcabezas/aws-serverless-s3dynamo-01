const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableDB = process.env.TABLEDYNAMO

module.exports.dynamodbPut = async (event, context) => {
    const { filenamedb, urldb } = JSON.parse(event.body);

    const params = {
        TableName: tableDB,
        Item: {
            id: context.awsRequestId,
            filenamedb: filenamedb,
            urldb: urldb
        }
    }
    try {
        const result = await dynamodb.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ result }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'No se pudo agregar el item,', detalle: error.message }),
        };
    }
}

module.exports.dynamodbUpdate = async (event, context) => {
    console.log('Evento id', event)
    const id = event.queryStringParameters.id;

    const { filenamedb, urldb } = JSON.parse(event.body);

    const params = {
        TableName: tableDB,
        Key: {
            "id": id,
        },
        UpdateExpression: "set filenamedb= :filenamedb, urldb= :urldb",
        ExpressionAttributeValues: {
            ":filenamedb": filenamedb,
            ":urldb": urldb
        },
        ReturnValues: 'ALL_NEW'
    }

    try {

        const oldRecordParams = {
            TableName: tableDB,
            Key: {
                "id": id
            },
            ReturnValues: 'ALL_OLD'
        };

        // Obtiene el valor anterior del registro
        const oldRecord = await dynamodb.get(oldRecordParams).promise();

        const updateRecord = await dynamodb.update(params).promise();


        return {
            statusCode: 200,
            body: JSON.stringify({
                oldRecord: oldRecord.Item,
                updatedRecord: updateRecord.Attributes
            })
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'No se pudo agregar el item,', detalle: error.message }),
        };
    }
}

module.exports.dynamodbDelete = async (event, context) => {

    const id = event.queryStringParameters.id;

    const params = {
        TableName: tableDB,
        Key: {
            "id": id,
        }
    }

    try {
        await dynamodb.delete(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Deleted' })
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message })
        }
    }

}

module.exports.dynamodbScan = async (event, context) => {
    const dynamodbD = new AWS.DynamoDB();

    if (event.queryStringParameters && event.queryStringParameters.id) {
        // Si el objeto queryStringParameters existe y tiene una propiedad id, accede a la propiedad id
        const paramsId = {
            TableName: tableDB,
            Key: {
                "id": event.queryStringParameters.id
            }
        }

        const result = await dynamodb.get(paramsId).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    } else {
        // Si el objeto queryStringParameters no existe o no tiene una propiedad id, ejecuta este código
        const params = {
            TableName: tableDB,
        }

        const result = await dynamodbD.scan(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    }



}