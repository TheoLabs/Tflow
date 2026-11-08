import { ValidateIf, type ValidationOptions } from 'class-validator';

/**
 * 값이 `null`이면 같은 프로퍼티의 나머지 검증을 건너뛴다.
 * - `null`      → 통과 (값을 비움)
 * - `undefined` → 나머지 검증 그대로 적용 (키 자체가 없으면 실패 → "필수지만 null 허용")
 * - 그 외 값     → 나머지 검증 그대로 적용
 *
 * `undefined`도 허용하려면 `@IsOptional()`을 쓴다 (null + undefined 모두 건너뜀).
 *
 * @example
 * @IsNullable()
 * @IsNumber()
 * departmentId: number | null;
 */
export function IsNullable(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateIf((_, value) => value !== null, validationOptions);
}
