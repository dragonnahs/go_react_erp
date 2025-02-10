package middleware

import (
	"erp-sys/pkg/logger"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				debug.PrintStack()
				logger.Log.Error("panic recovered",
					zap.Any("error", err),
					zap.String("stack", string(debug.Stack())),
				)
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"code": 500,
					"msg":  "Internal server error",
				})
			}
		}()
		c.Next()
	}
} 