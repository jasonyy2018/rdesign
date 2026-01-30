import http from '../request';

// 查询模板分类列表
export const getTemplateStyleListAsync: any = () => {
  return http.request({
    url: '/huajian/common/getTemplateCategoryList',
    method: 'get'
  });
};

// 新增分类
export const templateStyleAddAsync: any = (data: any) => {
  return http.request({
    url: '/huajian/template/templateCategoryAdd',
    method: 'post',
    data: data
  });
};

// 修改分类
export const templateStyleUpdateAsync: any = (data: any) => {
  return http.request({
    url: '/huajian/template/templateCategoryUpdate',
    method: 'put',
    data: data
  });
};

// 删除分类
export const templateStyleDeleteAsync: any = (id: string) => {
  return http.request({
    url: `/huajian/template/templateCategoryDelete/${id}`,
    method: 'delete'
  });
};

// 创建或者更新模版
export const templateAddAsync: any = (data: any) => {
  return http.request({
    url: '/huajian/createTemplate/templateAdd',
    method: 'post',
    data: data
  });
};

// 通过id查询模版数据
export const getTemplateByIdAsync: any = async (id: string) => {
  try {
    return await http.request({
      url: `/huajian/common/template/${id}`,
      method: 'get'
    });
  } catch (error) {
    console.warn('getTemplateByIdAsync failed, using fallback or default');
    return {
      status: 404,
      data: {
        status: 404,
        message: 'Template not found or unauthorized'
      }
    };
  }
};

// 查询模板列表
export const templateListAsync: any = async (params: any) => {
  try {
    return await http.request({
      url: '/huajian/common/templateList',
      method: 'get',
      params: params
    });
  } catch (error) {
    return {
      data: {
        status: 200,
        data: {
          list: [],
          total: 0
        }
      }
    };
  }
};

// 删除模板
export const deleteTemplateAsync: any = (id: string) => {
  return http.request({
    url: `/huajian/createTemplate/deleteTemplate/${id}`,
    method: 'delete'
  });
};

// 审核模板
export const auditTemplateAsync: any = (data: any) => {
  return http.request({
    url: '/huajian/createTemplate/auditTemplate',
    method: 'post',
    data: data
  });
};

// 保存草稿
export const saveDraftAsync: any = async (data: any) => {
  try {
    return await http.request({
      url: '/huajian/createUserTemplate/saveDraft',
      method: 'post',
      data: data
    });
  } catch (error) {
    console.warn('saveDraftAsync failed, returning mock success for guest');
    return {
      status: 200,
      data: {
        status: 200,
        data: {
          updateDate: new Date().toISOString()
        }
      }
    };
  }
};

// 根据模版id查询用户简历
export const getUsertemplateAsync: any = async (id: string) => {
  try {
    return await http.request({
      url: `/huajian/createUserTemplate/getUsertemplate/${id}`,
      method: 'get'
    });
  } catch (error) {
    return {
      status: 404,
      data: {
        status: 404,
        message: 'Guest user, no existing template'
      }
    };
  }
};

// 用户分页查询个人简历列表
export const getMyResumeListAsync: any = (params: any) => {
  return http.request({
    url: '/huajian/createUserTemplate/getMyResumeList',
    method: 'get',
    params: params
  });
};

// 删除个人简历
export const deleteUserResumeAsync: any = (params: { id: any }) => {
  return http.request({
    url: `/huajian/createUserTemplate/deleteUserResume/${params.id}`,
    method: 'delete'
  });
};

// 管理员分页查询用户简历列表
export const getUserResumeListAsync: any = (params: any) => {
  return http.request({
    url: '/huajian/createUserTemplate/getUserResumeList',
    method: 'get',
    params: params
  });
};

// 组织管理员分页查询用户简历列表
export const getOrgUserResumeListAsync: any = (params: any) => {
  return http.request({
    url: '/huajian/createUserTemplate/getOrgUserResumeList',
    method: 'get',
    params: params
  });
};

// 根据流水号id查询简历数据
export const getResumeDataBySerialNumberAsync: any = (params: any) => {
  return http.request({
    url: '/huajian/common/getResumeDataBySerialNumber',
    method: 'get',
    params: params
  });
};
