import Chance from 'chance';
import moment from 'moment';
import AWS from 'aws-sdk';

// TODO: Get region from Serverless variable
AWS.config.update({ region: 'ap-southeast-2' });

const chance = new Chance();
const db = new AWS.DynamoDB();

const mapItem = (item) => (
  {
    id: item.id.S,
    name: item.name.S,
    createdUtc: item.createdUtc.S
  }
);

const mapData = (data) => (
  {
    id: data.Attributes.id.S,
    name: data.Attributes.name.S
  }
);

export const getItems = (event, context, cb) => {
  console.log('getItems', JSON.stringify(event));

  const params = {
    TableName: 'items'
  };

  try {
    db.scan(params, (err, data) => {
      if (err) {
        cb(err);
      } else {
        const res = {
          'items': data.Items.map(mapItem)
        };

        cb(null, res);
      }
    });
  } catch (err) {
    cb(err);
  }
};

export const getItem = (event, context, cb) => {
  console.log('getItem', JSON.stringify(event));

  const params = {
    TableName: 'items',
    Key: {
      id: { S: event.path.id }
    }
  };

  try {
    db.getItem(params, (err, data) => {
      if (err) {
        cb(err);
      } else {
        cb(null, mapItem(data.Item));
      }
    });
  } catch (err) {
    cb(err);
  }
};

export const createItem = (event, context, cb) => {
  console.log('createItem', JSON.stringify(event));

  const params = {
    Item: {
      id: {
        S: chance.guid()
      },
      name: {
        S: event.body.name
      },
      createdUtc: {
        S: moment().utc().toISOString()
      }
    },
    TableName: 'items',
    ConditionExpression: 'attribute_not_exists(id)'
  };

  try {
    db.putItem(params, (err, data) => {
      if (err) {
        cb(err);
      } else {
        cb(null, mapItem(params.Item));
      }
    });
  } catch (err) {
    cb(err);
  }
};

export const updateItem = (event, context, cb) => {
  console.log('updateItem', JSON.stringify(event));

  const params = {
    TableName: 'items',
    Key: {
      id: { S: event.path.id }
    },
    AttributeUpdates: {
      name: {
        Action: 'PUT',
        Value: { S: event.body.name }
      }
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    db.updateItem(params, (err, data) => {
        if (err) {
          cb(err);
        } else {
          cb(null, mapData(data));
        }
    });
  } catch (err) {
    cb(err);
  }
};

export const deleteItem = (event, context, cb) => {
  console.log('deleteItem', JSON.stringify(event));

  const params = {
    TableName: 'items',
    Key: {
      id: { S: event.path.id }
    }
  };

  try {
    db.deleteItem(params, (err, data) => {
        if (err) {
          cb(err);
        } else {
          cb(null, null);
        }
    });
  } catch (err) {
    cb(err);
  }
};
