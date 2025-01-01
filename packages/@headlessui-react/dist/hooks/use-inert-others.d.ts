/**
 * Mark all elements on the page as inert, except for the ones that are allowed.
 *
 * We move up the tree from the allowed elements, and mark all their siblings as
 * inert. If any of the children happens to be a parent of one of the elements,
 * then that child will not be marked as inert.
 *
 * E.g.:
 *
 * ```html
 * <body>                      <!-- Stop at body -->
 *   <header></header>         <!-- Inert, sibling of parent -->
 *   <main>                    <!-- Not inert, parent of allowed element -->
 *     <div>Sidebar</div>      <!-- Inert, sibling of parent -->
 *     <div>                   <!-- Not inert, parent of allowed element -->
 *       <listbox>             <!-- Not inert, parent of allowed element -->
 *         <button></button>   <!-- Not inert, allowed element -->
 *         <options></options> <!-- Not inert, allowed element -->
 *       </listbox>
 *     </div>
 *   </main>
 *   <footer></footer>         <!-- Inert, sibling of parent -->
 * </body>
 * ```
 */
export declare function useInertOthers(enabled: boolean, { allowed, disallowed, }?: {
    allowed?: () => (HTMLElement | null)[];
    disallowed?: () => (HTMLElement | null)[];
}): void;
