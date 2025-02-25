package controller

import (
	"erp-sys/internal/model"
	"erp-sys/internal/service"
	"erp-sys/pkg/response"
	"strconv"
	"time"

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

	// 格式化时间为ISO格式字符串
	formatTime := func(t time.Time) string {
		return t.Format("2006-01-02")
	}

	// 格式化任务数据
	formattedTasks := make([]map[string]interface{}, 0)
	for _, task := range project.Tasks {
		formattedTasks = append(formattedTasks, map[string]interface{}{
			"id":          task.ID,
			"title":       task.Title,
			"description": task.Description,
			"startTime":   formatTime(task.StartTime),
			"endTime":     formatTime(task.EndTime),
			"phase":       task.Phase,
			"status":      task.Status,
			"order":       task.Order,
		})
	}

	// 按阶段组织数据
	phases := make(map[model.Phase]struct {
		StartDate string                   `json:"startDate"`
		EndDate   string                   `json:"endDate"`
		Tasks     []map[string]interface{} `json:"tasks"`
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
			StartDate string                   `json:"startDate"`
			EndDate   string                   `json:"endDate"`
			Tasks     []map[string]interface{} `json:"tasks"`
		}{
			StartDate: formatTime(project.StartDate),
			EndDate:   formatTime(project.EndDate),
			Tasks:     []map[string]interface{}{},
		}
	}

	// 将任务按阶段分组
	for _, task := range formattedTasks {
		phase := task["phase"].(model.Phase)
		phaseData := phases[phase]
		phaseData.Tasks = append(phaseData.Tasks, task)
		phases[phase] = phaseData
	}

	response.Success(ctx, gin.H{
		"id":        project.ID,
		"name":      project.Name,
		"startDate": formatTime(project.StartDate),
		"endDate":   formatTime(project.EndDate),
		"phases":    phases,
	})
}

// UpdateTaskPosition 更新任务位置
func (c *ProjectController) UpdateTaskPosition(ctx *gin.Context) {
	taskID, _ := strconv.ParseUint(ctx.Param("taskId"), 10, 32)
	var req struct {
		NewPhase    string `json:"newPhase"`
		NewStartDate string `json:"newStartDate"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.Error(ctx, 400, "无效的请求参数")
		return
	}

	// 解析日期
	newStartDate, err := time.Parse("2006-01-02", req.NewStartDate)
	if err != nil {
		response.Error(ctx, 400, "无效的日期格式")
		return
	}

	err = c.projectService.UpdateTaskPosition(uint(taskID), model.Phase(req.NewPhase), newStartDate)
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

// CreateTask 创建任务
func (pc *ProjectController) CreateTask(c *gin.Context) {
	var req struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		StartTime   string `json:"startTime" binding:"required"`
		EndTime     string `json:"endTime" binding:"required"`
		Status      string `json:"status" binding:"required"`
		Phase       string `json:"phase" binding:"required"`
		ProjectId   uint   `json:"projectId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	// 解析时间字符串
	startTime, err := time.Parse("2006-01-02 15:04:05", req.StartTime)
	if err != nil {
		response.Error(c, 400, "无效的开始时间格式")
		return
	}
	endTime, err := time.Parse("2006-01-02 15:04:05", req.EndTime)
	if err != nil {
		response.Error(c, 400, "无效的结束时间格式")
		return
	}

	task := &model.Task{
		Title:       req.Title,
		Description: req.Description,
		StartTime:   startTime,
		EndTime:     endTime,
		Status:      model.TaskStatus(req.Status),
		Phase:       model.Phase(req.Phase),
		ProjectID:   req.ProjectId,
	}

	if err := pc.projectService.CreateTask(task); err != nil {
		response.Error(c, 500, err.Error())
		return
	}

	response.Success(c, task)
} 