import java.util.ArrayList;
import java.util.List;

// A real JVM OutOfMemoryError, run with a deliberately small heap (examples.py runs this with
// -Xmx32m). The process survives the exception: this is the signature the kernel's own OOM
// killer does NOT produce (that one ends the process outright).
public class OOMTest {
    public static void main(String[] args) {
        List<byte[]> held = new ArrayList<>();
        try {
            while (true) {
                held.add(new byte[1024 * 1024]); // 1 MiB at a time
            }
        } catch (OutOfMemoryError e) {
            int chunks = held.size();
            held.clear(); // free heap first: printing itself needs to allocate, and there's almost none left
            held = null;
            System.gc();
            System.out.println("CAUGHT:" + e.getClass().getName());
            System.out.println("CHUNKS_HELD:" + chunks);
            System.out.println("STILL_ALIVE:true");
        }
    }
}
