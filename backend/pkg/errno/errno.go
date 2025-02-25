package errno

type Errno struct {
    Code    int
    Message string
}

func (e *Errno) WithMessage(msg string) *Errno {
    return &Errno{Code: e.Code, Message: msg}
}

func (e *Errno) WithDetails(details ...string) *Errno {
    return &Errno{Code: e.Code, Message: e.Message}
}

var (
    ErrInvalidParam = &Errno{Code: 400, Message: "Invalid parameters"}
    ErrDatabase     = &Errno{Code: 500, Message: "Database error"}
)

// 添加 Error 方法
func (e *Errno) Error() string {
    return e.Message
} 