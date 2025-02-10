package constants

// 响应状态码
const (
	SUCCESS       = 200
	ERROR         = 500
	UNAUTHORIZED  = 401
	FORBIDDEN     = 403
	NOT_FOUND     = 404
	INVALID_PARAM = 400
)

// 响应消息
const (
	SUCCESS_MSG = "操作成功"
	ERROR_MSG   = "操作失败"

	CREATE_SUCCESS = "创建成功"
	CREATE_ERROR   = "创建失败"
	
	UPDATE_SUCCESS = "更新成功"
	UPDATE_ERROR   = "更新失败"
	
	DELETE_SUCCESS = "删除成功"
	DELETE_ERROR   = "删除失败"
	
	UNAUTHORIZED_MSG = "未授权或授权已过期"
	FORBIDDEN_MSG    = "无权限访问"
	NOT_FOUND_MSG    = "资源不存在"
) 