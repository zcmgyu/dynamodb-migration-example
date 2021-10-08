const { DocumentClient, TABLE_NAME } = require('./dynamodb');

const times = (x, fn) => Array.from(Array(x).keys()).flatMap(fn);

const run = async () => {
  const db = new DocumentClient();
  await Promise.all(times(10, (i) =>
    [db.put({
      TableName: TABLE_NAME,
      Item: {
        PK: `User:${i}`,
        SK: 'meta',
        Name: `User Name ${i}`,
      }
    }).promise(),
    db.put({
      TableName: TABLE_NAME,
      Item: {
        PK: `Car:${i}`,
        SK: 'meta',
        Name: `Car Name ${i}`,
      }
    }).promise()]
  ))
}

const main = () => {
  return run().then(() => {
    console.info('Success');
    process.exit(0);
  }).catch((e) => {
    console.error('Error: ', e);
    process.exit(1);
  });
}

main();