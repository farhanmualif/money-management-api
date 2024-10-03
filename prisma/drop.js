import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://kitasiapa856:WDE2Y3J9RyVCxnXr@moneymanagement.xlekg.mongodb.net/money_management?retryWrites=true&w=majority',
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const dropCollections = async () => {
  try {
    const models = [
      'account',
      'token',
      'profile',
      'sub_account',
      'income_resource',
      'transaction',
      'goal',
      'expense',
    ];

    for (const model of models) {
      const modelName = `${model.toLowerCase()}s`;
      await mongoose.connection.collection(modelName).drop();
      console.log(`Dropped collection: ${modelName}`);
    }
  } catch (err) {
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
  }
};

connectDB().then(() => dropCollections());
