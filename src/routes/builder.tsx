import { createFileRoute } from '@tanstack/react-router'
import BuilderPage from '../components/builder/BuilderPage'

export const Route = createFileRoute('/builder')({ component: BuilderPage })
