const express = require("express");
const kafka = require("kafka-node");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

const dbRunning = async () => {
  mongoose.connect(process.env.MONGO_URL);
  const User = mongoose.model("user", {
    name: String,
    email: String,
    password: String,
  });

  const client = new kafka.KafkaClient({
    kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVERS,
  });

  const consumer = new kafka.Consumer(
    client,
    [
      {
        topic: process.env.KAFKA_TOPIC,
        offset: 0,
        partition: 0,
      },
    ],
    {
      autoCommit: false,
    }
  );

  consumer.addTopics(
    [process.env.KAFKA_BOOTSTRAP_SERVERS],
        (err, added) => {
                console.log('Added..........');
        }
  );

  consumer.on("message", async (message) => {
    const user = await new User(JSON.parse(message.value));
    await user.save();
  });

  consumer.on("error", async (err) => {
    console.error("err", err);
  });
};

setTimeout(dbRunning, 5000);

app.get("/", (res) => {
        return  res.json({
                "message": "app2"
        });
});

app.listen(process.env.PORT, () => {
        console.log('app2 running on', process.env.PORT);
});
