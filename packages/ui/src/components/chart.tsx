"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "../utils/cn"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: { light: string; dark: string } }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(([theme, prefix]) =>
            [
              `[data-chart=${id}]${prefix} {`,
              ...colorConfig.map(([key, itemConfig]) => {
                const color = itemConfig.theme
                  ? itemConfig.theme[theme as keyof typeof itemConfig.theme]
                  : itemConfig.color
                return `  --color-${key}: ${color};`
              }),
              "}",
            ].join("\n")
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
      ...props
    }: any,
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const itemConfig = config[key as keyof typeof config]
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload?.map((item: any, index: number) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = config[key as keyof typeof config]
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey || index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  nestLabel ? "items-center" : "items-start"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {nestLabel ? (
                      <div className="flex items-center gap-2">
                        {!hideIndicator && (
                          <div
                            className="shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                            style={
                              {
                                "--color-border": indicatorColor,
                                "--color-bg": indicatorColor,
                                ...(indicator === "dashed"
                                  ? {
                                      background: "transparent",
                                      borderStyle: "dashed",
                                      borderWidth: 2,
                                    }
                                  : indicator === "line"
                                    ? {
                                        borderRadius: 0,
                                        borderWidth: 2,
                                        background: "transparent",
                                      }
                                    : {}),
                              } as React.CSSProperties & Record<string, any>
                            }
                          />
                        )}
                        {tooltipLabel}
                      </div>
                    ) : (
                      <>
                        {itemConfig?.icon ? (
                          <itemConfig.icon />
                        ) : (
                          !hideIndicator && (
                            <div
                              className="shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                              style={
                                {
                                  "--color-border": indicatorColor,
                                  "--color-bg": indicatorColor,
                                  ...(indicator === "dashed"
                                    ? {
                                        background: "transparent",
                                        borderStyle: "dashed",
                                        borderWidth: 2,
                                      }
                                    : indicator === "line"
                                      ? {
                                          borderRadius: 0,
                                          borderWidth: 2,
                                          background: "transparent",
                                        }
                                      : {}),
                                } as React.CSSProperties & Record<string, any>
                              }
                            />
                          )
                        )}
                        <div
                          className={cn(
                            "flex-1 leading-none",
                            nestLabel ? "text-right" : ""
                          )}
                        >
                          <div className="flex items-center gap-2 font-medium text-foreground">
                            {itemConfig?.label || item.name}
                            {nestLabel && item.value && (
                              <span className={cn("font-mono font-normal tabular-nums text-muted-foreground")}>
                                {typeof formatter === "function"
                                  ? formatter(
                                      item.value,
                                      item.name || "",
                                      item,
                                      index,
                                      item.payload
                                    )
                                  : item.value}
                              </span>
                            )}
                          </div>
                          {!nestLabel && item.value && (
                            <div className="mt-1 font-mono font-normal tabular-nums text-muted-foreground">
                              {typeof formatter === "function"
                                ? formatter(
                                    item.value,
                                    item.name || "",
                                    item,
                                    index,
                                    item.payload
                                  )
                                : item.value}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Legend> &
    React.ComponentProps<"div"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    {
      className,
      hideIcon = false,
      payload,
      verticalAlign = "bottom",
      nameKey,
      ...props
    }: any,
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
        {...props}
      >
        {payload?.map((item: any) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = config[key as keyof typeof config]

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label || item.value}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}

