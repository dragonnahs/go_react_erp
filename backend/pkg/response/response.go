package response

import (
	"erp-sys/pkg/constants"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response 基础响应结构
type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code: constants.SUCCESS,
		Msg:  constants.SUCCESS_MSG,
		Data: data,
	})
}

// SuccessWithMsg 自定义消息的成功响应
func SuccessWithMsg(c *gin.Context, data interface{}, msg string) {
	c.JSON(http.StatusOK, Response{
		Code: constants.SUCCESS,
		Msg:  msg,
		Data: data,
	})
}

// Error 错误响应
func Error(c *gin.Context, code int, msg string) {
	c.JSON(http.StatusOK, Response{
		Code: code,
		Msg:  msg,
		Data: nil,
	})
}

// ParamError 参数错误响应
func ParamError(c *gin.Context, msg string) {
	Error(c, constants.INVALID_PARAM, msg)
}

// Unauthorized 未授权响应
func Unauthorized(c *gin.Context) {
	Error(c, constants.UNAUTHORIZED, constants.UNAUTHORIZED_MSG)
}

// Forbidden 无权限响应
func Forbidden(c *gin.Context) {
	Error(c, constants.FORBIDDEN, constants.FORBIDDEN_MSG)
}

// ServerError 服务器错误响应
func ServerError(c *gin.Context) {
	Error(c, constants.ERROR, constants.ERROR_MSG)
}

// NotFound 资源不存在响应
func NotFound(c *gin.Context) {
	Error(c, constants.NOT_FOUND, constants.NOT_FOUND_MSG)
}

// List 列表数据响应
type List struct {
	Total int64       `json:"total"`
	Items interface{} `json:"items"`
}

// SuccessList 列表成功响应
func SuccessList(c *gin.Context, items interface{}, total int64) {
	Success(c, List{
		Total: total,
		Items: items,
	})
} 