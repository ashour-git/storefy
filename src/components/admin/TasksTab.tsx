export interface DashboardTask {
  label: string;
  href: string;
  done: boolean;
}

export function TasksTab({ tasks }: { tasks: DashboardTask[] }) {
  if (tasks.length === 0) {
    return (
      <div role="status" className="admin-section-state">
        <p>All caught up. Nothing needs your attention.</p>
      </div>
    );
  }
  return (
    <ul className="admin-task-list">
      {tasks.map((task) => (
        <li key={task.label} className={task.done ? 'admin-task-done' : undefined}>
          <a href={task.href}>
            <span aria-hidden="true">{task.done ? '✓' : '○'}</span> {task.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
