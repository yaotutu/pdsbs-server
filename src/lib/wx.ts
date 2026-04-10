const WX_APPID = process.env.WX_APPID || "";
const WX_SECRET = process.env.WX_SECRET || "";

interface WxSession {
  openid?: string;
  session_key?: string;
  errcode?: number;
  errmsg?: string;
}

interface WxPhoneResult {
  errcode?: number;
  errmsg?: string;
  phone_info?: {
    phoneNumber?: string;
    purePhoneNumber?: string;
    countryCode?: number;
  };
}

// 通过 code 换取 openid 和 session_key
const code2Session = async (code: string): Promise<WxSession> => {
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.errcode) {
    throw new Error(`微信登录失败: ${data.errmsg}`);
  }
  return data;
};

// 获取微信 access_token
const getAccessToken = async (): Promise<string> => {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WX_APPID}&secret=${WX_SECRET}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.errcode) {
    throw new Error(`获取 access_token 失败: ${data.errmsg}`);
  }
  return data.access_token;
};

// 通过手机号 code 获取真实手机号
const getPhoneNumber = async (phoneCode: string): Promise<string> => {
  const accessToken = await getAccessToken();
  const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ code: phoneCode }),
  });
  const data: WxPhoneResult = await res.json();
  if (data.errcode || !data.phone_info?.phoneNumber) {
    throw new Error(`获取手机号失败: ${data.errmsg || "未知错误"}`);
  }
  return data.phone_info.phoneNumber;
};

export { code2Session, getPhoneNumber };
