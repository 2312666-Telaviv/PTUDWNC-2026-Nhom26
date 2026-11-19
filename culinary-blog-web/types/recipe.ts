  import { z } from 'zod';

// Schema dùng chung cho form tạo mới và cập nhật công thức.
// Project đang dùng Zod v3 nên giữ cú pháp required_error / invalid_type_error.
const imageUrlSchema = z
  .string()
  .trim()
  .max(500, 'Đường dẫn ảnh không được vượt quá 500 ký tự')
  .refine(
    (value) => value === '' || value.startsWith('/') || /^https?:\/\//i.test(value),
    'Đường dẫn ảnh phải là URL http(s) hoặc đường dẫn bắt đầu bằng /'
  )
  .optional();

export const recipeSchema = z.object({
  title: z
    .string({
      required_error: 'Vui lòng nhập tên công thức',
      invalid_type_error: 'Tên công thức không hợp lệ',
    })
    .min(5, 'Tên công thức phải có ít nhất 5 ký tự')
    .max(200, 'Tên công thức không được vượt quá 200 ký tự'),

  description: z
    .string({
      required_error: 'Vui lòng nhập mô tả',
      invalid_type_error: 'Mô tả không hợp lệ',
    })
    .min(20, 'Mô tả phải có ít nhất 20 ký tự')
    .max(2000, 'Mô tả không được vượt quá 2000 ký tự'),

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
    .min(0, 'Thời gian chuẩn bị không được âm')
    .max(1440, 'Thời gian chuẩn bị tối đa 1440 phút'),

  cookTimeMinutes: z
    .number({
      required_error: 'Vui lòng nhập thời gian nấu',
      invalid_type_error: 'Thời gian nấu phải là số',
    })
    .int('Thời gian nấu phải là số nguyên')
    .min(0, 'Thời gian nấu không được âm')
    .max(1440, 'Thời gian nấu tối đa 1440 phút'),

  servings: z
    .number({
      required_error: 'Vui lòng nhập số khẩu phần',
      invalid_type_error: 'Số khẩu phần phải là số',
    })
    .int('Số khẩu phần phải là số nguyên')
    .min(1, 'Số khẩu phần tối thiểu là 1')
    .max(100, 'Số khẩu phần tối đa là 100'),

  difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
    errorMap: () => ({ message: 'Độ khó không hợp lệ' }),
  }),

  primaryImageUrl: imageUrlSchema,

  tags: z
    .string()
    .trim()
    .max(300, 'Danh sách tag không được vượt quá 300 ký tự')
    .optional(),

  steps: z
    .array(
      z.object({
        title: z
          .string()
          .trim()
          .max(150, 'Tiêu đề bước không được vượt quá 150 ký tự')
          .optional(),
        description: z
          .string({
            required_error: 'Vui lòng nhập mô tả bước',
            invalid_type_error: 'Mô tả bước không hợp lệ',
          })
          .min(10, 'Mô tả bước phải có ít nhất 10 ký tự')
          .max(2000, 'Mô tả bước không được vượt quá 2000 ký tự'),
        durationMinutes: z
          .number({
            invalid_type_error: 'Thời gian của bước phải là số',
          })
          .int('Thời gian của bước phải là số nguyên')
          .min(0, 'Thời gian của bước không được âm')
          .max(1440, 'Thời gian của bước tối đa 1440 phút')
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
          .min(2, 'Tên nguyên liệu phải có ít nhất 2 ký tự')
          .max(200, 'Tên nguyên liệu không được vượt quá 200 ký tự'),
        quantity: z
          .string({
            required_error: 'Vui lòng nhập số lượng',
            invalid_type_error: 'Số lượng phải là chuỗi',
          })
          .min(1, 'Số lượng phải có ít nhất 1 ký tự')
          .max(50, 'Số lượng không được vượt quá 50 ký tự'),
        unit: z
          .string({
            required_error: 'Vui lòng nhập đơn vị',
            invalid_type_error: 'Đơn vị không hợp lệ',
          })
          .min(1, 'Đơn vị phải có ít nhất 1 ký tự')
          .max(50, 'Đơn vị không được vượt quá 50 ký tự'),
      })
    )
    .min(1, 'Cần có ít nhất 1 nguyên liệu'),
});

// Chỉ cho phép tạo công thức ở trạng thái nháp hoặc xuất bản ngay.
export const recipeCreateStatusSchema = z.enum(['Draft', 'Published'], {
  errorMap: () => ({ message: 'Trạng thái khi tạo chỉ có thể là Draft hoặc Published' }),
});

export const recipeRequestSchema = recipeSchema.extend({
  status: recipeCreateStatusSchema.optional(),
});

export const recipeStatusSchema = z.enum(['Draft', 'Published', 'Archived', 'Deleted'], {
  errorMap: () => ({ message: 'Trạng thái công thức không hợp lệ' }),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;
export type RecipeRequestData = z.infer<typeof recipeRequestSchema>;

// Giữ tên cũ để không phá vỡ import hiện có (dùng bởi nhánh Hương).
export const createRecipeSchema = recipeSchema;
export type CreateRecipeFormData = RecipeFormData;
