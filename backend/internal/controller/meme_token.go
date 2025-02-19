package controller

import (
	"erp-sys/pkg/response"

	"github.com/gin-gonic/gin"
)

type MemeTokenController struct {
    memeTokenService *service.MemeTokenService
}

func NewMemeTokenController() *MemeTokenController {
    return &MemeTokenController{
        memeTokenService: service.NewMemeTokenService(),
    }
}

// GetHotMemeTokens 获取最火 Meme 币列表
func (c *MemeTokenController) GetHotMemeTokens(ctx *gin.Context) {
    tokens, err := c.memeTokenService.GetHotMemeTokens()
    if err != nil {
        response.Error(ctx, 500, "获取数据失败")
        return
    }

    response.Success(ctx, tokens)
} 