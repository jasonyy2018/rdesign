import http from '../request';
import { generateCerebrasResumeStream, generateCerebrasResume } from './cerebras';

console.log('AI API module loaded v4 - Model: qwen-3-235b-a22b-instruct-2507');

export const aiModelListAsync = async (params: any) => {
  try {
    const res = await http.request({
      url: '/huajian/ai/getModelList',
      method: 'get',
      params: params
    });
    if (res && res.data && res.data.status === 200) {
      res.data.data.unshift({
        _id: 'cerebras-qwen',
        model_name: 'Cerebras-Qwen',
        model_is_free: 1
      });
      return res;
    }
  } catch (error) {
    console.warn('Backend model list failed, using fallback');
  }
  return {
    status: 200,
    data: {
      status: 200,
      data: [{ _id: 'cerebras-qwen', model_name: 'Cerebras-Qwen', model_is_free: 1 }]
    }
  };
};

export const addModelAsync = (data: any) => {
  return http.request({
    url: '/huajian/ai/addModel',
    method: 'post',
    data: data
  });
};

export const updateModelAsync = (data: any) => {
  return http.request({
    url: '/huajian/ai/updateIntegralPayConfig',
    method: 'post',
    data: data
  });
};

export const deleteModelAsync = (id: string) => {
  return http.request({
    url: `/huajian/ai/deleteModel/${id}`,
    method: 'delete'
  });
};

export const translateTextAsync = async (data: any) => {
  if (data.model && data.model.startsWith('Cerebras')) {
    const messages = [
      {
        role: 'system',
        content: '你是一位精通多国语言的专业翻译官。'
      },
      { role: 'user', content: data.text }
    ];
    const result = await generateCerebrasResume({
      messages,
      model: 'qwen-3-235b-a22b-instruct-2507'
    });
    return {
      data: {
        status: 200,
        data: result
      }
    };
  }
  return http.request({
    url: '/huajian/ai/translateText',
    method: 'post',
    data: data
  });
};

export const cancleAiTranslateTextAsync = () => {
  return http.cancelRequest('/huajian/ai/translateText');
};

export const cancelPolishTextStreamAsync = (controller: AbortController) => {
  controller.abort();
};

export const cancelCreateTextStreamAsync = (controller: AbortController) => {
  controller.abort();
};

export const getPolishIntegralAsync = () => {
  return http.request({
    url: '/huajian/ai/getPolishIntegral',
    method: 'get'
  });
};

export const getCreateIntegralAsync = () => {
  return http.request({
    url: '/huajian/ai/getCreateIntegral',
    method: 'get'
  });
};

export const getPolishModelListAsync = async () => {
  try {
    const res = await http.request({
      url: '/huajian/ai/getPolishModelList',
      method: 'get'
    });
    if (res && res.data && res.data.status === 200) {
      res.data.data.unshift({
        _id: 'cerebras-qwen-polish',
        model_name: 'Cerebras-Qwen-Polish',
        model_is_free: 1
      });
      return res;
    }
  } catch (error) {
    console.warn('Backend polish model list failed, using fallback');
  }
  return {
    status: 200,
    data: {
      status: 200,
      data: [{ _id: 'cerebras-qwen-polish', model_name: 'Cerebras-Qwen-Polish', model_is_free: 1 }]
    }
  };
};

export const getCreateModelListAsync = async () => {
  try {
    const res = await http.request({
      url: '/huajian/ai/getCreateModelList',
      method: 'get'
    });
    if (res && res.data && res.data.status === 200) {
      res.data.data.unshift({
        _id: 'cerebras-qwen-create',
        model_name: 'Cerebras-Qwen-Create',
        model_is_free: 1
      });
      return res;
    }
  } catch (error) {
    console.warn('Backend create model list failed, using fallback');
  }
  return {
    status: 200,
    data: {
      status: 200,
      data: [{ _id: 'cerebras-qwen-create', model_name: 'Cerebras-Qwen-Create', model_is_free: 1 }]
    }
  };
};

export const polishTextStreamAsync = (
  data: any,
  onMessage: (chunk: string) => void,
  onError: (error: any) => void,
  onComplete?: () => void
) => {
  if (data.model && data.model.startsWith('Cerebras')) {
    const messages = [
      {
        role: 'system',
        content: '你是一位专业的简历润色专家。'
      },
      { role: 'user', content: data.text }
    ];
    return generateCerebrasResumeStream(
      { messages, model: 'qwen-3-235b-a22b-instruct-2507' },
      onMessage,
      onError,
      onComplete
    );
  }
  return http.streamRequest('/huajian/ai/polishTextStream', data, onMessage, onError, onComplete);
};

export const createTextStreamAsync = (
  data: any,
  onMessage: (chunk: string) => void,
  onError: (error: any) => void,
  onComplete?: () => void
) => {
  if (data.model && data.model.startsWith('Cerebras')) {
    const messages = [
      {
        role: 'system',
        content: '你是一位精通简历撰写的专家。'
      },
      { role: 'user', content: data.text }
    ];
    return generateCerebrasResumeStream(
      { messages, model: 'qwen-3-235b-a22b-instruct-2507' },
      onMessage,
      onError,
      onComplete
    );
  }
  return http.streamRequest('/huajian/ai/createTextStream', data, onMessage, onError, onComplete);
};

export const optimizeResumeStreamAsync = (
  data: any,
  onMessage: (chunk: string) => void,
  onError: (error: any) => void,
  onComplete?: () => void
) => {
  if (data.model && data.model.startsWith('Cerebras')) {
    const messages = [
      {
        role: 'system',
        content: '你是一位资深的职业生涯规划师和简历诊断专家。'
      },
      { role: 'user', content: `简历名称：${data.resumeName}\n\n简历内容：\n${data.text}` }
    ];
    return generateCerebrasResumeStream(
      { messages, model: 'qwen-3-235b-a22b-instruct-2507' },
      onMessage,
      onError,
      onComplete
    );
  }
  return http.streamRequest(
    '/huajian/ai/optimizeResumeStream',
    data,
    onMessage,
    onError,
    onComplete
  );
};

export const cancelOptimizeResumeStreamAsync = (controller: AbortController) => {
  controller.abort();
};

export const getAiOptimizeLogsListAsync = (params: any) => {
  return http.request({
    url: '/huajian/ai/getAiOptimizeLogsList',
    method: 'get',
    params: params
  });
};

export const generateResumeStreamAsync = (
  data: any,
  onMessage: (chunk: string) => void,
  onError: (error: any) => void,
  onComplete?: () => void
) => {
  return http.streamRequest(
    '/huajian/ai/generateResumeStream',
    data,
    onMessage,
    onError,
    onComplete
  );
};

export const generateMarkdownResumeStreamAsync = (
  data: any,
  onMessage: (chunk: string) => void,
  onError: (error: any) => void,
  onComplete?: () => void
) => {
  return http.streamRequest(
    '/huajian/ai/generateMDResumeStream',
    data,
    onMessage,
    onError,
    onComplete
  );
};

export const cancelGenerateResumeStreamAsync = (controller: AbortController) => {
  controller.abort();
};

export const jsonToMarkdownStreamByAiAsync = (
  data: any,
  onMessage: (chunk: string) => void,
  onError: (error: any) => void,
  onComplete?: () => void
) => {
  return http.streamRequest(
    '/huajian/ai/jsonToMarkdownStreamByAi',
    data,
    onMessage,
    onError,
    onComplete
  );
};

export const cancelToMarkdownStreamAsync = (controller: AbortController) => {
  controller.abort();
};

export const getSerialNumberAsync = async () => {
  try {
    return await http.request({
      url: '/huajian/ai/getSerialNumber',
      method: 'get'
    });
  } catch (error) {
    return {
      data: {
        status: 200,
        data: 'guest_serial_' + Date.now()
      }
    };
  }
};

export const aiFailAsync = async (data: any) => {
  try {
    return await http.request({
      url: '/huajian/ai/aiFail',
      method: 'post',
      data: data
    });
  } catch (error) {
    return { data: { status: 200 } };
  }
};

export const getGenerateResumeIntegralAsync = async () => {
  try {
    return await http.request({
      url: '/huajian/ai/getGenerateResumeIntegral',
      method: 'get'
    });
  } catch (error) {
    return { data: { status: 200, data: 0 } };
  }
};

export const getGenerateResumeModelListAsync = async () => {
  try {
    const res = await http.request({
      url: '/huajian/ai/getGenerateResumeModelList',
      method: 'get'
    });
    if (res && res.data && res.data.status === 200) {
      res.data.data.unshift({
        _id: 'cerebras-qwen-generate',
        model_name: 'Cerebras-Qwen-Generate',
        model_is_free: 1
      });
      return res;
    }
  } catch (error) {
    // ignore
  }
  return {
    data: {
      status: 200,
      data: [
        { _id: 'cerebras-qwen-generate', model_name: 'Cerebras-Qwen-Generate', model_is_free: 1 }
      ]
    }
  };
};

export const getOptimizeResumeIntegralAsync = async () => {
  try {
    return await http.request({
      url: '/huajian/ai/getOptimizeResumeIntegral',
      method: 'get'
    });
  } catch (error) {
    return { data: { status: 200, data: 0 } };
  }
};

export const getOptimizeResumeModelListAsync = async () => {
  try {
    const res = await http.request({
      url: '/huajian/ai/getOptimizeResumeModelList',
      method: 'get'
    });
    if (res && res.data && res.data.status === 200) {
      res.data.data.unshift({
        _id: 'cerebras-qwen-optimize',
        model_name: 'Cerebras-Qwen-Optimize',
        model_is_free: 1
      });
      return res;
    }
  } catch (error) {
    // ignore
  }
  return {
    data: {
      status: 200,
      data: [
        { _id: 'cerebras-qwen-optimize', model_name: 'Cerebras-Qwen-Optimize', model_is_free: 1 }
      ]
    }
  };
};

export const getOptimizeResumeUploadIntegralAsync = async () => {
  try {
    return await http.request({
      url: '/huajian/ai/getOptimizeResumeUploadIntegral',
      method: 'get'
    });
  } catch (error) {
    return { data: { status: 200, data: 0 } };
  }
};

export const getAiLogsByAdminAsync = (params: any) => {
  return http.request({
    url: '/huajian/ai/getAiLogsByAdmin',
    method: 'get',
    params: params
  });
};

export const aiOptimizeResumeByPdfTextStreamAsync = (
  data: any,
  onMessage: (chunk: string) => void,
  onError: (error: any) => void,
  onComplete?: () => void
) => {
  return http.streamRequest(
    '/huajian/ai/aiOptimizeResumeByPdfTextStream',
    data,
    onMessage,
    onError,
    onComplete
  );
};
