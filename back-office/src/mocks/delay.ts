/**
 * mock 응답 흉내 — 200~400ms 기다린 뒤 handler를 실행한다.
 * handler가 던진 ApiError는 그대로 reject 된다. 결과는 깊은 복사로 돌려줘 저장소 객체가 화면에서 변형되지 않게 한다.
 */
export function mockRequest<T>(handler: () => T): Promise<T> {
  const wait = 200 + Math.round(Math.random() * 200)
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(structuredClone(handler()))
      } catch (error) {
        reject(error)
      }
    }, wait)
  })
}
