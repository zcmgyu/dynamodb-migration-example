const { DocumentClient, TABLE_NAME } = require("./dynamodb");

const scanDB = async (updateFn) => {
  const DB = new DocumentClient();
  let lastEvalKey;
  do {
    const { Items, LastEvaluatedKey } = await DB.scan({
      TableName: TABLE_NAME,
      ExclusiveStartKey: lastEvalKey,
    }).promise();
    lastEvalKey = LastEvaluatedKey;
    await Promise.all(Items.map((item) => updateFn(item, DB)));
  } while (lastEvalKey)
}

const checkForMigrationSequence = async (sequence) => {
  const db = new DocumentClient();
  const { Item } = await db.get({
    TableName: TABLE_NAME,
    Key: {
      PK: 'migration',
      SK: 'meta',
    },
  }).promise();
  return Item && Object.values(Item.__batches)
    .reduce((acc, val) => acc.concat(val), [])
    .includes(sequence);
}

const setMigrationIsRun = async (batch, sequence) => {
  const db = new DocumentClient();
  const { Item } = await db.get({
    TableName: TABLE_NAME,
    Key: {
      PK: 'migration',
      SK: 'meta',
    },
  }).promise();
  const existingBatches = Item ? Item.__batches : {};
  const batchToUpdate = existingBatches[batch] || [];
  batchToUpdate.push(sequence);
  const updatedItem = {
    ...Item,
    PK: 'migration',
    SK: 'meta',
    __batches: {
      ...existingBatches,
      [batch]: batchToUpdate,
    }
  }
  await db.put({
    TableName: TABLE_NAME,
    Item: updatedItem,
  }).promise()
}

const removeSequenceFromBatch = async (batchNumber, sequence) => {
  const db = new DocumentClient();
  const { Item } = await db.get({
    TableName: TABLE_NAME,
    Key: {
      PK: 'migration',
      SK: 'meta',
    },
  }).promise();
  if (!Item) {
    return;
  }
  const sequences = Item.__batches[`${batchNumber}`];
  const index = sequences.indexOf(sequence);
  if (index > -1) {
    sequences.splice(index, 1);
  }
  if (sequences.length === 0) {
    await removeBatch(batchNumber);
  } else {
    const updatedItem = {
      ...Item,
      PK: 'migration',
      SK: 'meta',
      __batches: {
        ...Item.__batches,
        [batchNumber]: sequences,
      }
    };
    await db.put({
      TableName: TABLE_NAME,
      Item: updatedItem,
    }).promise();
  }
};

const getLatestBatch = async () => {
  const db = new DocumentClient();
  const { Item } = await db.get({
    TableName: TABLE_NAME,
    Key: {
      PK: 'migration',
      SK: 'meta'
    },
  }).promise();
  if (!Item || !Item.__batches) {
    return;
  }
  const batches = Object.keys(Item.__batches).map((x) => parseInt(x, 10)).sort().reverse();
  const latestBatchNumber = batches[0];
  if (!latestBatchNumber) {
    return;
  }
  return {
    batchNumber: latestBatchNumber,
    sequences: Item.__batches[latestBatchNumber],
  }
};

const removeBatch = async (batch) => {
  const db = new DocumentClient();
  const { Item } = await db.get({
    TableName: TABLE_NAME,
    Key: {
      PK: 'migration',
      SK: 'meta'
    },
  }).promise();
  if (!Item) {
    return;
  }
  const currentBatches = Item.__batches;
  delete currentBatches[`${batch}`];
  const updatedItem = {
    ...Item,
    PK: 'migration',
    SK: 'meta',
    __batches: currentBatches
  };
  await db.put({
    TableName: TABLE_NAME,
    Item: updatedItem,
  }).promise();
}

const migrate = async (batch, sequence, updateFn) => {
  const isMigrationRun = await checkForMigrationSequence(sequence);
  if (!isMigrationRun) {
    await scanDB(updateFn);
    await setMigrationIsRun(batch, sequence);
  }
}

const revert = async (updateFn) => {
  await scanDB(updateFn);
}

module.exports = {
  migrate,
  revert,
  getLatestBatch,
  removeBatch,
  removeSequenceFromBatch,
};