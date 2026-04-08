const WX_APPID = process.env.WX_APPID || "";
const WX_SECRET = process.env.WX_SECRET || "";

interface WxSession {
  openid?: string;
  session_key?: string;
  errcode?: number;
  errmsg?: string;
}

export async function code2Session(code: string): Promise<WxSession> {
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.errcode) {
    throw new Error(`WeChat login failed: ${data.errmsg}`);
  }

  return data;
}
