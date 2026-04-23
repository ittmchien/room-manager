# Plan: Fix dot-accessed sub-components for Next.js App Router

## Problem
Next.js App Router không hỗ trợ `<Component.SubComponent />` syntax (e.g. `<Tabs.Tab />`, `<List.Item />`). Cần destructure hoặc assign ra biến riêng.

## Affected Files (20 files)

### App pages — antd-mobile (12 files)

| File | Sub-components used |
|------|-------------------|
| `app/(app)/(dashboard)/rooms/page.tsx` | `Tabs.Tab` |
| `app/(app)/(dashboard)/invoices/page.tsx` | `List.Item` |
| `app/(app)/(dashboard)/invoices/[id]/page.tsx` | `Skeleton.Title`, `Skeleton.Paragraph` |
| `app/(app)/(dashboard)/dashboard/page.tsx` | `List.Item`, `Skeleton.Paragraph` |
| `app/(app)/(dashboard)/contracts/page.tsx` | `Skeleton.Title`, `Skeleton.Paragraph` |
| `app/(app)/(dashboard)/expenses/page.tsx` | `List.Item`, `Skeleton.Title`, `Skeleton.Paragraph` |
| `app/(app)/(dashboard)/reports/page.tsx` | `Skeleton.Paragraph` |
| `components/tenants/tenant-list.tsx` | `List.Item`, `Collapse.Panel` |
| `components/rooms/room-detail-popup.tsx` | `Skeleton.Title`, `Skeleton.Paragraph` |
| `components/settings/service-fee-list.tsx` | `List.Item` |
| `components/invoices/generate-invoice-modal.tsx` | `Skeleton.Paragraph` |
| `components/settings/utility-config-form.tsx` | `Skeleton.Paragraph` |

### Admin pages — antd desktop (8 files)

| File | Sub-components used |
|------|-------------------|
| `app/(admin)/admin/login/page.tsx` | `Form.Item` |
| `app/(admin)/admin/(protected)/page.tsx` | `Typography.Text` |
| `app/(admin)/admin/(protected)/users/[id]/page.tsx` | `Form.Item`, `Descriptions.Item`, `Input.Search` |
| `app/(admin)/admin/(protected)/tags/page.tsx` | `Form.Item` |
| `app/(admin)/admin/(protected)/pricing/page.tsx` | `Form.Item` |
| `app/(admin)/admin/(protected)/campaigns/page.tsx` | `Form.Item` |
| `app/(admin)/admin/(protected)/settings/page.tsx` | `Form.Item` |
| `app/(admin)/admin/(protected)/billing/page.tsx` | `Form.Item` |

## Approach

Mỗi file: thêm destructure sau import. Ví dụ:

```tsx
// Before
import { Tabs } from 'antd-mobile';
<Tabs.Tab title="..." key="...">

// After  
import { Tabs } from 'antd-mobile';
const Tab = Tabs.Tab;
<Tab title="..." key="...">
```

Mapping:
- `Tabs.Tab` → `const Tab = Tabs.Tab`
- `List.Item` → `const ListItem = List.Item`
- `Collapse.Panel` → `const CollapsePanel = Collapse.Panel`
- `Skeleton.Title` → `const SkeletonTitle = Skeleton.Title`
- `Skeleton.Paragraph` → `const SkeletonParagraph = Skeleton.Paragraph`
- `Form.Item` → `const FormItem = Form.Item`
- `Descriptions.Item` → `const DescriptionsItem = Descriptions.Item`
- `Typography.Text` → `const TypographyText = Typography.Text`
- `Input.Search` → `const InputSearch = Input.Search`

## Steps

1. Fix 12 app-side files (antd-mobile)
2. Fix 8 admin files (antd desktop)
3. Run `tsc --noEmit` to verify
