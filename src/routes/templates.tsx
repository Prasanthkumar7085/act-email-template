import TemplatesPage from '@/components/templates/TemplatesPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/templates')({ component: TemplatesPage })
