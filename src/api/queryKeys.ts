export const queryKeys = {
  tours: {
    all: ['tours', 'v2'] as const,
    published: ['tours', 'published', 'v2'] as const,
    detail: (slug: string) => ['tour', slug, 'v2'] as const,
    byId: (id: string) => ['tourById', id, 'v2'] as const,
  },
  scenes: {
    byTour: (tourId: string) => ['scenes', tourId] as const,
    detail: (sceneId: string) => ['scenes', 'detail', sceneId] as const,
  },
  links: {
    byScene: (sceneId: string) => ['links', sceneId] as const,
  },
  users: {
    all: ['users'] as const,
    me: ['users', 'me'] as const,
  },
} as const;
