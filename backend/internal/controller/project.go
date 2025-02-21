package controller

import (
	"erp-sys/internal/model"
	"erp-sys/internal/service"
	"erp-sys/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProjectController struct {
	projectService *service.ProjectService
}

func NewProjectController() *ProjectController {
	return &ProjectController{
		projectService: service.NewProjectService(),
	}
}

// GetCurrentProject 获取当前项目
func (c *ProjectController) GetCurrentProject(ctx *gin.Context) {
	project, err := c.projectService.GetCurrentProject()
	if err != nil {
		response.Error(ctx, 500, "获取项目失败")
		return
	}

	// 按阶段组织任务数据
	phases := make(map[model.Phase]struct {
		StartDate string      `json:"start_date"`
		EndDate   string      `json:"end_date"`
		Tasks     []model.Task `json:"tasks"`
	})

	// 初始化所有阶段
	allPhases := []model.Phase{
		model.PhasePreparation,
		model.PhaseImplementation,
		model.PhaseExecution,
		model.PhaseCompletion,
		model.PhaseAcceptance,
	}

	for _, phase := range allPhases {
		phases[phase] = struct {
			StartDate string      `json:"start_date"`
			EndDate   string      `json:"end_date"`
			Tasks     []model.Task `json:"tasks"`
		}{
			StartDate: project.StartDate.Format("2006-01-02"),
			EndDate:   project.EndDate.Format("2006-01-02"),
			Tasks:     []model.Task{},
		}
	}

	// 将任务按阶段分组
	for _, task := range project.Tasks {
		phaseData := phases[task.Phase]
		phaseData.Tasks = append(phaseData.Tasks, task)
		phases[task.Phase] = phaseData
	}

	response.Success(ctx, gin.H{
		"id":        project.ID,
		"name":      project.Name,
		"startDate": project.StartDate.Format("2006-01-02"),
		"endDate":   project.EndDate.Format("2006-01-02"),
		"phases":    phases,
	})
}

// UpdateTaskPosition 更新任务位置
func (c *ProjectController) UpdateTaskPosition(ctx *gin.Context) {
	taskID, _ := strconv.ParseUint(ctx.Param("taskId"), 10, 32)
	var req struct {
		NewPhase string `json:"newPhase"`
		NewOrder int    `json:"newOrder"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, 400, "无效的请求参数")
		return
	}

	err := c.projectService.UpdateTaskPosition(uint(taskID), model.Phase(req.NewPhase), req.NewOrder)
	if err != nil {
		response.Error(ctx, 500, "更新任务位置失败")
		return
	}

	response.Success(ctx, nil)
}

// UpdateTaskStatus 更新任务状态
func (c *ProjectController) UpdateTaskStatus(ctx *gin.Context) {
	taskID, _ := strconv.ParseUint(ctx.Param("taskId"), 10, 32)
	var req struct {
		Status string `json:"status"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, 400, "无效的请求参数")
		return
	}

	err := c.projectService.UpdateTaskStatus(uint(taskID), model.TaskStatus(req.Status))
	if err != nil {
		response.Error(ctx, 500, "更新任务状态失败")
		return
	}

	response.Success(ctx, nil)
} 