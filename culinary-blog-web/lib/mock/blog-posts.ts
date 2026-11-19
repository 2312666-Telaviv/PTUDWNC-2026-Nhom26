import { BlogComment, BlogPost, BlogTag } from '@/types/blog';

/**
 * Dữ liệu giả cho giao diện tĩnh của blog app (Lab 6 - Phần 4).
 * TODO: khi có API thật, thay toàn bộ file này bằng lớp gọi API của nhóm
 * (phần 1 & 2) và bỏ các hàm getMock* bên dưới.
 */

const authors = {
  minhAnh: {
    id: 'author-1',
    name: 'Nguyễn Minh Anh',
    role: 'Chef Hà Nội',
    avatarUrl: null,
  },
  thuHa: {
    id: 'author-2',
    name: 'Trần Thu Hà',
    role: 'Food Blogger',
    avatarUrl: null,
  },
  quocBao: {
    id: 'author-3',
    name: 'Lê Quốc Bảo',
    role: 'Chuyên gia nấu ăn gia đình',
    avatarUrl: null,
  },
};

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'cach-nau-pho-bo-ngon-nhat-ha-noi',
    title: 'Cách nấu phở bò ngon nhất kiểu Hà Nội',
    excerpt:
      'Nước dùng trong veo, thịt bò mềm và vị nước mắm chua ngọt đúng chuẩn - bí quyết của dân ẩm thực Hà Nội.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1200&q=70',
    author: authors.minhAnh,
    publishedAt: '2024-05-18T03:20:00Z',
    tags: ['phở', 'món chính', 'gia đình'],
    readingMinutes: 8,
    viewCount: 12480,
    content: [
      'Nước phở ngon không nằm ở gia vị mạnh mà nằm ở độ trong của nước dùng và thời gian hầm xương. Nhiều bà nội trợ thường nêm nhiều gia vị để "bắt" mùi, nhưng cách của người Hà Nội lại tôn trọng sự tinh tế: chỉ hồi, quế, đinh hương và một ít gừng.',
      'Bắt đầu bằng việc chần xương kỹ để nước dùng được trong. Xương bò và xương ống heo luộc sơ bộ với gừng, sau đó rửa sạch để nước dùng có màu trong. Đây là bước nhiều người bỏ qua nhưng quyết định 70% chất lượng của món phở.',
      'Nước dùng hầm trong 6 đến 8 tiếng với lửa vừa, không được sôi mạnh để thịt không nát và nước không đục. Trong lúc hầm, bạn có thể nêm nếm: muối, đường phèn, nước mắm ngon và chút nước lọc.',
      'Phần ăn cũng đòi hỏi sự tỉ mỉ. Thịt bò tái thái mỏng, phở trụng mềm trong nước dùng nóng rồi xếp ra bát. Rau thơm và hành lá cắt nhỏ rắc lên trên, ngay khi ăn nên ăn nóng để cảm nhận đúng vị nước dùng.',
    ],
  },
  {
    id: 'post-2',
    slug: 'bi-quyet-nuoc-mam-chua-ngot-chuan-vi',
    title: 'Bí quyết pha nước mắm chua ngọt chuẩn vị miền Tây',
    excerpt:
      'Tỉ lệ nước mắm, đường và chanh - ba nguyên liệu đơn giản nhưng cần đúng tỉ lệ để nước chấm cân bằng.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=70',
    author: authors.thuHa,
    publishedAt: '2024-05-12T08:00:00Z',
    tags: ['nước chấm', 'mẹo nấu ăn'],
    readingMinutes: 5,
    viewCount: 8210,
    content: [
      'Nước mắm chua ngọt là linh hồn của rất nhiều món miền Tây như bánh xèo, gỏi cuốn hay bánh hỏi. Công thức phổ biến là 3 thìa nước mắm, 2 thìa đường, 1 thìa giấm và nửa cốt chanh.',
      'Điểm mấu chốt là đường phèn thay vì đường trắng, vì đường phèn có mùi thơm và cho vị tròn hơn. Giấm nên dùng giấm gạo hoặc giấm táo, tránh giấm chấm công nghiệp vì vị quá gắt.',
      'Khi pha, hãy hoà tan đường với nước mắm trước rồi mới thêm giấm và chanh, tránh cho chanh vào quá sớm sẽ làm nước chấm bị đục và mất thơm.',
      'Nếu muốn nước chấm đậm đà hơn, có thể thêm một ít tỏi băm và ớt tươi. Nhớ nếm sau khi pha, điều chỉnh tỉ lệ theo khẩu vị từng người.',
    ],
  },
  {
    id: 'post-3',
    slug: 'top-5-mon-banh-xeo-gion-rum-tai-nha',
    title: 'Top 5 món bánh xèo giòn rụm ngay tại nhà',
    excerpt:
      'Bột đúng tỉ lệ, chảo đủ nóng và bánh tráng đúng độ ẩm - ba yếu tố quyết định thành công hay thất bại.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=70',
    author: authors.quocBao,
    publishedAt: '2024-05-05T02:10:00Z',
    tags: ['bánh xèo', 'món nhẹ', 'kỹ thuật'],
    readingMinutes: 7,
    viewCount: 9630,
    content: [
      'Bánh xèo ở nhà thường dễ bị dính, nát hoặc chỉ giòn ở một mặt. Nguyên nhân thường gặp là bột pha quá đặc và chảo chưa đủ nóng trước khi đổ bột.',
      'Bột nên pha với nước ngọt hoặc nước lọc pha chút bột nở, tỉ lệ khoảng 1 bột gạo với 1,3 nước. Bột pha xong để nghỉ 20 phút sẽ cho bánh giòn và dễ tróc hơn.',
      'Chảo phải thật nóng, bỏ một lượng dầu vừa đủ và quét đều bằng gió hoặc miếng vải ẩm. Khi đổ bột, hạt bột sủi lên là nhiệt đã đủ.',
      'Nhân thịt nên trộn với nấm, miến và củ cải muối băm nhỏ, để nước tiết ra giúp bánh xèo thơm và có vị ngọt tự nhiên.',
    ],
  },
  {
    id: 'post-4',
    slug: 'huong-dan-lam-banh-cuon-mem-min',
    title: 'Hướng dẫn làm bánh cuốn mềm mịn chuẩn Hà Nội',
    excerpt:
      'Kỹ thuật tráng bánh mỏng đều, cách chọn bột gạo và công thức nhân thịt mộc nhĩ thơm ngon.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1559054663-e8d23213f55c?auto=format&fit=crop&w=1200&q=70',
    author: authors.minhAnh,
    publishedAt: '2024-04-28T09:30:00Z',
    tags: ['bánh cuốn', 'món nhẹ', 'kỹ thuật'],
    readingMinutes: 9,
    viewCount: 11240,
    content: [
      'Bánh cuốn mềm mịn hay dễ rách phụ thuộc rất nhiều vào bột gạo. Bột gạo nghiền mịn, pha với một ít bột nở và nước ấm, để nghỉ từ 30 phút trở lại là tốt nhất.',
      'Khi tráng, tay phải giữ miếng vải thật căng và quệt một vòng tròn đều tay. Bánh mỏng quá sẽ dễ vỡ khi cuốn, đặc quá thì dày và không mềm.',
      'Nhân thịt lợn xay nhỏ, nấm hương băm và nêm với nước mắm, đường, tiêu và chút mỡ lợn để nhân có độ trơn, không bị khô.',
      'Khi cuốn, đặt miếng chả lên bánh, đặt cây đũa lên nhân rồi cuộn chặt tay. Bánh cuốn xong xếp lên đĩa, phủ khăn ẩm để không khô.',
    ],
  },
  {
    id: 'post-5',
    slug: 'ca-phe-sua-da-kieu-sai-gon',
    title: 'Cà phê sữa đá kiểu Sài Gòn và cách pha tại nhà',
    excerpt:
      'Công thức pha cà phê sữa đá đậm chất Sài Gòn, cùng bí quyết chọn cà phê và cách pha phin cho đúng vị.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=70',
    author: authors.thuHa,
    publishedAt: '2024-04-20T04:45:00Z',
    tags: ['đồ uống', 'phổ biến'],
    readingMinutes: 4,
    viewCount: 15320,
    content: [
      'Cà phê sữa đá Sài Gòn đặc trưng ở vị đậm đầu tiên và vị sữa nhạt phía cuối. Muốn có cảm giác này, bạn cần dùng cà phê rang đậm và pha với nước sôi đúng nhiệt độ.',
      'Tỷ lệ kinh điển là 2 thìa cà phê cho 100 ml nước, thêm 2 thìa sữa đặc. Nên dùng sữa đặc có đường vì sữa tươi làm vị nhạt và loãng, mất đúng chất Sài Gòn.',
      'Pha phin cổ truyền: cho cà phê vào phin, ấn nhẹ, rồi đổ nước sôi từ từ. Đợi nước chảy hết qua bộ lọc rồi đổ ra ly, thêm sữa và đá.',
      'Nếu không có phin, bạn vẫn có thể pha theo kiểu "đá xay" với máy pha cà phê và đá bào. Điểm quan trọng vẫn là cà phê rang đậm và sữa đặc.',
    ],
  },
  {
    id: 'post-6',
    slug: 'goi-cuon-tom-thit-tuoi-mat',
    title: 'Gỏi cuốn tôm thịt tươi mát cho ngày hè',
    excerpt:
      'Bí quyết cuộn gỏi không rách, không chẹp và luồn nước chấm đậu phộng thơm ngon.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=70',
    author: authors.quocBao,
    publishedAt: '2024-04-12T07:15:00Z',
    tags: ['gỏi cuốn', 'món nhẹ', 'mùa hè'],
    readingMinutes: 6,
    viewCount: 7890,
    content: [
      'Gỏi cuốn đẹp mắt nhưng khó cuộn nếu bạn không chuẩn bị bánh tráng đúng cách. Bánh tráng nên ngâm nước ở mức vừa phải, vớ ra rồi trải lên thớt, để mềm nhưng không nhớp.',
      'Tôm và thịt luộc xong để nguội, thái tôm làm đôi. Rau nhúng sống (cải chút, rau muống, giá) chần nhanh rồi vắt khô, để rau không làm bánh ướt.',
      'Khi cuộn, xếp nguyên liệu ở một phần hai ba bánh tráng, cuộn chặt hai vòng rồi gấp đầu bánh vào. Dùng ngón tay ướt sẽ dễ cuộn hơn nhiều.',
      'Nước chấm đậu phộng giã nhuyễn với nước mắm, đường, giấm và ít tỏi. Cho thêm chút đậu phộng giã dở vào bát chấm để tăng vị béo.',
    ],
  },
  {
    id: 'post-7',
    slug: 'lam-bo-kho-dua-thom-ngon-ngay-tet',
    title: 'Làm bò kho dừa thơm ngon cho ngày Tết',
    excerpt:
      'Cách hầm bò kho nước dừa mềm tan, nước sốt sánh đặc và vị ngọt vừa đủ cho mâm cỗ ngày Tết.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=70',
    author: authors.minhAnh,
    publishedAt: '2024-04-02T02:00:00Z',
    tags: ['bò kho', 'món chính', 'Tết'],
    readingMinutes: 8,
    viewCount: 10420,
    content: [
      'Bò kho dừa khác bò kho thường ở chỗ nước sốt sánh nhẹ, vị ngọt thanh và màu đỏ au của cà chua nướng. Nếu thêm nước dừa tươi vào cuối cùng thì món ăn dịu hơn hẳn.',
      'Thịt bò chọn phần nạm hoặc bắp, cắt miếng vừa ăn rồi ướp với nước mắm, đường, tiêu và hành tỏi băm trong 30 phút.',
      'Cà chua nên rang chín trước rồi mới xay nhuyễn, giúp nước sốt đậm màu và đậm vị hơn so với dùng cà chua sống. Gia vị gồm sả, gừng, quế, hồi và chút ớt khô.',
      'Hầm nhỏ lửa trong khoảng 2 tiếng để thịt mềm mà nước sốt không cạn. Nêm lại nếm vị rồi thêm nước dừa tươi, đun thêm 10 phút rồi tắt bếp.',
    ],
  },
  {
    id: 'post-8',
    slug: 'bi-quyet-bao-quan-rau-cu-tuoi-lau',
    title: 'Bí quyết bảo quản rau củ tươi lâu trong tủ lạnh',
    excerpt:
      'Rau xanh héo, củ tỏi mọc mầm chỉ vì cách bảo quản chưa đúng. Mẹo đơn giản giúp thực phẩm tươi hơn cả tuần.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=70',
    author: authors.thuHa,
    publishedAt: '2024-03-25T10:30:00Z',
    tags: ['mẹo nấu ăn', 'bảo quản thực phẩm'],
    readingMinutes: 5,
    viewCount: 6580,
    content: [
      'Rau củ bảo quản lâu nhờ tách riêng từng loại và đúng điều kiện ẩm. Rau lá nên rửa, lau khô thật kỹ rồi bỏ vào túi có khăn giấy, thay giấy mỗi 2 ngày.',
      'Củ tỏi, hành và khoai tây nên để nơi thoáng mát, không khí lưu thông tốt. Đặt chúng cạnh nhau trong hộp thoáng khí sẽ giúp giữ độ khô và kéo dài thời gian bảo quản.',
      'Cà chua và các loại trái cây giàu nước không nên để trong tủ lạnh, vì hơi lạnh làm mất mùi và vị. Bảo quản ở nhiệt độ phòng sẽ giữ được hương vị tự nhiên.',
      'Thức ăn đã nấu nên để nguội trước khi cho vào tủ, chia vào hộp nhỏ và ghi ngày. Nhớ không để lâu quá 3 ngày để đảm bảo an toàn thực phẩm.',
    ],
  },
];

/** Bình luận mẫu cho các bài viết */
export const mockBlogComments: BlogComment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    authorName: 'Lê Thị Mai',
    content: 'Bài viết rất hữu ích, mình đã thử và nước dùng trong veo thật. Cảm ơn tác giả!',
    createdAt: '2024-05-19T02:15:00Z',
  },
  {
    id: 'comment-2',
    postId: 'post-1',
    authorName: 'Phạm Đức Duy',
    content: 'Cho mình hỏi thêm nước dùng có nên nêm nước mắm trong lúc hầm không ạ?',
    createdAt: '2024-05-19T08:40:00Z',
  },
  {
    id: 'comment-3',
    postId: 'post-1',
    authorName: 'Nguyễn Minh Anh',
    content: 'Duy nhé, mình thường nêm khoảng 2 muỗng cà phê nước mắm ngay trước khi tắt bếp để giữ vị thơm.',
    createdAt: '2024-05-20T01:05:00Z',
  },
  {
    id: 'comment-4',
    postId: 'post-2',
    authorName: 'Hoàng Thị Nga',
    content: 'Tỉ lệ 3 - 2 - 1 chuẩn thật, nhà mình dùng công thức này năm nay rồi.',
    createdAt: '2024-05-13T03:20:00Z',
  },
  {
    id: 'comment-5',
    postId: 'post-3',
    authorName: 'Đặng Văn Hùng',
    content: 'Bột để nghỉ 20 phút là bước mình bỏ qua, hóa ra đó là lý do bánh không giòn.',
    createdAt: '2024-05-06T11:00:00Z',
  },
  {
    id: 'comment-6',
    postId: 'post-5',
    authorName: 'Trương Quang Vinh',
    content: 'Dùng sữa đặc là đúng rồi, sữa tươi làm cà phê nhạt quá.',
    createdAt: '2024-04-21T06:30:00Z',
  },
  {
    id: 'comment-7',
    postId: 'post-7',
    authorName: 'Bùi Khánh Linh',
    content: 'Nước sốt của bò kho dừa nhà mình sánh đặc lắm, ai làm theo công thức này cũng thành công.',
    createdAt: '2024-04-04T09:10:00Z',
  },
];

/** Lấy danh sách bài viết từ dữ liệu giả */
export function getMockBlogPosts(): BlogPost[] {
  return mockBlogPosts;
}

/** Tìm một bài viết theo slug */
export function getMockBlogPostBySlug(slug: string): BlogPost | undefined {
  return mockBlogPosts.find((post) => post.slug === slug);
}

/** Lấy bình luận của một bài viết */
export function getMockBlogCommentsByPostId(postId: string): BlogComment[] {
  return mockBlogComments.filter((comment) => comment.postId === postId);
}

/** Lấy danh sách tag kèm số lượng bài viết, dùng cho vùng lọc theo tag */
export function getMockBlogTags(): BlogTag[] {
  const counter = new Map<string, number>();

  for (const post of mockBlogPosts) {
    for (const tag of post.tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counter.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'vi'));
}
