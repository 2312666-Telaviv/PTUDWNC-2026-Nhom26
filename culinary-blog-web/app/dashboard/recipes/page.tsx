import { redirect } from 'next/navigation';

export default function DashboardRecipesPage() {
  redirect('/recipes/manage');
}
