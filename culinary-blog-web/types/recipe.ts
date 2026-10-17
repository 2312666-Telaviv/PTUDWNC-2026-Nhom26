import { z } from 'zod';

// Schema validate form tạo công thức mới.
// Lưu ý: project đang dùng Zod v3 (3.25.76) nên dùng cú pháp v3
// (required_error / invalid_type_error) cho thông báo lỗi tiếng Việt.
export const createRecipeSchema = z.object({
  title: z
    .string({
      required_error: 'Vui lòng nhập tên công thức',
      invalid_type_error: 'Tên công thức không hợp lệ',
    })
    .min(5, 'Tên công thức phải có ít nhất 5 ký tự')
    .max(200, 'Tên công thức không được vượt quá 200 ký tự'),

  description: z
    .string({
      invalid_type_error: 'Mô tả không hợp lệ',
    })
    .min(20, 'Mô tả phải có ít nhất 20 ký tự')
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .optional(),

  categoryId: z
    .string({
      required_error: 'Vui lòng chọn danh mục',
      invalid_type_error: 'Danh mục không hợp lệ',
    })
    .uuid('Danh mục không hợp lệ'),

  prepTimeMinutes: z
    .number({
      required_error: 'Vui lòng nhập thời gian chuẩn bị',
      invalid_type_error: 'Thời gian chuẩn bị phải là số',
    })
    .int('Thời gian chuẩn bị phải là số nguyên')
    .min(1, 'Thời gian chuẩn bị tối thiểu 1 phút')
    .max(1440, 'Thời gian chuẩn bị tối đa 1440 phút'),

  cookTimeMinutes: z
    .number({
      required_error: 'Vui lòng nhập thời gian nấu',
      invalid_type_error: 'Thời gian nấu phải là số',
    })
    .int('Thời gian nấu phải là số nguyên')
    .min(1, 'Thời gian nấu tối thiểu 1 phút')
    .max(1440, 'Thời gian nấu tối đa 1440 phút'),

  servings: z
    .number({
      required_error: 'Vui lòng nhập số khẩu phần',
      invalid_type_error: 'Số khẩu phần phải là số',
    })
    .int('Số khẩu phần phải là số nguyên')
    .min(1, 'Số khẩu phần tối thiểu là 1')
    .max(50, 'Số khẩu phần tối đa là 50'),

  difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
    errorMap: () => ({ message: 'Độ khó không hợp lệ' }),
  }),

  steps: z
    .array(
      z.object({
        description: z
          .string({
            required_error: 'Vui lòng nhập mô tả bước',
            invalid_type_error: 'Mô tả bước không hợp lệ',
          })
          .min(10, 'Mô tả bước phải có ít nhất 10 ký tự'),
        durationMinutes: z
          .number({
            invalid_type_error: 'Thời gian của bước phải là số',
          })
          .int('Thời gian của bước phải là số nguyên')
          .positive('Thời gian của bước phải là số dương')
          .optional(),
      })
    )
    .min(1, 'Cần có ít nhất 1 bước thực hiện'),

  ingredients: z
    .array(
      z.object({
        name: z
          .string({
            required_error: 'Vui lòng nhập tên nguyên liệu',
            invalid_type_error: 'Tên nguyên liệu không hợp lệ',
          })
          .min(2, 'Tên nguyên liệu phải có ít nhất 2 ký tự'),
        quantity: z
          .number({
            required_error: 'Vui lòng nhập số lượng',
            invalid_type_error: 'Số lượng phải là số',
          })
          .positive('Số lượng phải là số dương'),
        unit: z
          .string({
            required_error: 'Vui lòng nhập đơn vị',
            invalid_type_error: 'Đơn vị không hợp lệ',
          })
          .min(1, 'Đơn vị phải có ít nhất 1 ký tự'),
        notes: z
          .string({
            invalid_type_error: 'Ghi chú không hợp lệ',
          })
          .optional(),
      })
    )
    .min(1, 'Cần có ít nhất 1 nguyên liệu'),
});

export type CreateRecipeFormData = z.infer<typeof createRecipeSchema>;
