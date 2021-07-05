import { expect, sinon } from "../../utils/testUtils";
import { getRedisCacheByKey } from "../../../app/utils/redis";
import { RedisClient } from "redis";

describe("Redis utils", () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });
  describe("getRedisCacheByKey @redisUtil", () => {
    it("should retrieve a value given a key", async () => {
      const redisClientStub = {
        get: sandbox.stub().yields(null, "aValue"),
      } as Partial<RedisClient>;
      const result = await getRedisCacheByKey(
        redisClientStub as RedisClient,
        "akey"
      );

      expect(result).to.be.eq("aValue");
    });

    it("should fail retrieving a value given a key", async () => {
      const redisClientStub = {
        get: sandbox.stub().yields("error", null),
      } as Partial<RedisClient>;
      await getRedisCacheByKey(redisClientStub as RedisClient, "akey").catch(
        (err) => {
          expect(err).to.be.eq("error");
        }
      );
    });
  });
});
