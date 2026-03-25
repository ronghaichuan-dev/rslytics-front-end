import { request } from '@umijs/max';

export interface Event {
  id: number;
  event_name: string;
  status: 1 | 2;
  created_at: string;
  updated_at: string;
}

export interface EventListParams {
  page: number;
  size: number;
  event_name?: string;
  status?: 1 | 2;
}

export interface EventListResult {
  total: number;
  list: Event[];
}

export interface EventDropdownItem {
  id: number;
  event_name: string;
}

export async function getEventList(
  params: EventListParams,
): Promise<EventListResult> {
  return request('/admin/event/list', { params });
}

export async function getEventDropdown(): Promise<{
  list: EventDropdownItem[];
}> {
  return request('/admin/event/dropdown');
}

export async function createEvent(body: {
  event_name: string;
  status?: 1 | 2;
}): Promise<Event> {
  return request('/admin/event/create', { method: 'POST', data: body });
}

export async function updateEvent(body: {
  id: number;
  event_name?: string;
  status?: 1 | 2;
}): Promise<Event> {
  return request('/admin/event/update', { method: 'PUT', data: body });
}

export async function deleteEvent(id: number): Promise<void> {
  return request('/admin/event/delete', { method: 'DELETE', data: { id } });
}
