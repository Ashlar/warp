import { BlockHeightKey, BlockHeightSwCache, GQLEdgeInterface, InteractionsLoader, LoggerFactory } from '@smartweave';

const logger = LoggerFactory.INST.create(__filename);

/**
 * Very simple and naive implementation of cache for InteractionsLoader layer.
 * It hits the cache only if we have stored value at the exact required block height.
 *
 * A better implementation would require getting "highest" available block height value from cache
 * - and then downloading missing transactions using GQL.
 */
export class CacheableContractInteractionsLoader implements InteractionsLoader {
  constructor(
    private readonly baseImplementation: InteractionsLoader,
    private readonly cache: BlockHeightSwCache<GQLEdgeInterface[]>
  ) {}

  async load(contractId: string, blockHeight: number): Promise<GQLEdgeInterface[]> {
    logger.debug('Loading interactions', {
      contractId,
      blockHeight
    });

    const cached = this.cache.get(contractId, blockHeight);

    if (cached !== null) {
      logger.debug('InteractionsLoader - hit from cache!');
      return cached.cachedValue;
    } else {
      const result = await this.baseImplementation.load(contractId, blockHeight);
      this.cache.put(new BlockHeightKey(contractId, blockHeight), result);
      return result;
    }
  }
}
