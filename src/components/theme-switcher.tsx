import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Laptop, Palette } from "lucide-react";

export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("purple")}>
          <Palette className="mr-2 h-4 w-4 text-purple-500" />
          <span>Purple</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("blue")}>
          <Palette className="mr-2 h-4 w-4 text-blue-500" />
          <span>Blue</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("green")}>
          <Palette className="mr-2 h-4 w-4 text-green-500" />
          <span>Green</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("orange")}>
          <Palette className="mr-2 h-4 w-4 text-orange-500" />
          <span>Orange</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
