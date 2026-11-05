import { DddBaseAggregate } from './ddd-base-aggregate';

/**
 * Root Aggregate는 N개의 Aggregate를 포함하는 최상위 Aggregate입니다.
 */
export abstract class DddRootAggregate extends DddBaseAggregate {}
