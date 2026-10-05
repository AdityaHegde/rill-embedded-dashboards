export function formatEvent({
	data: { method, params }
}: {
	data: { method: string; params: unknown };
}) {
	console.log(`[${method}]`, params ?? '');
}
