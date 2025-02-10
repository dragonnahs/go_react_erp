package middleware

import (
	"erp-sys/pkg/jwt"
	"strings"

	"erp-sys/pkg/response"

	"github.com/gin-gonic/gin"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c)
			c.Abort()
			return
		}
		
		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			response.Unauthorized(c)
			c.Abort()
			return
		}
		
		claims, err := jwt.ParseToken(parts[1])
		if err != nil {
			response.Unauthorized(c)
			c.Abort()
			return
		}
		
		c.Set("userId", claims.UserId)
		c.Next()
	}
} 