import { NextResponse } from "next/server";

export function success(data: unknown = null, message = "ok") {
  return NextResponse.json({ code: 0, message, data });
}

export function error(message = "error", code = -1, status = 400) {
  return NextResponse.json({ code, message, data: null }, { status });
}

export function unauthorized(message = "未登录或登录已过期") {
  return NextResponse.json({ code: 401, message, data: null }, { status: 401 });
}
